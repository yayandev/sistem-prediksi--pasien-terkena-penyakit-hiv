/**
 * runner.ts
 * =========
 * ML runner — loads training data FROM FIRESTORE, preprocesses it, trains KNN,
 * and exposes predict() for the Predictor component.
 */

import { getPatients, type PatientData } from '../lib/firestore';
import { runFullPreprocessing } from '../utils/preprocessing';
import { normalizeDataset, normalizeFeatureArray, getBounds, getLabels } from '../utils/normalization';
import { smoteAllClasses } from '../utils/sMOTE';
import { knnPredictWithDetails } from '../utils/knn';
import type { RawDatasetRow } from '../utils/preprocessing';

const CLASS_LABELS: Record<number, string> = {
  0: 'Belum Tahu',
  1: 'Bukan ODHIV',
  2: 'ODHIV',
};

const FEATURE_NAMES = [
  'Umur', 'Jenis Kelamin', 'Kelompok Populasi', 'Alasan Kunjungan',
  'Riwayat Tes HIV', 'Riwayat IMS', 'Jumlah Pasangan', 'Penggunaan Kondom',
  'NAPZA Suntik', 'Status Pernikahan', 'Usia Pertama Hubungan', 'Terapi ARV', 'Gejala Klinis',
];

let isReady = false;
let normalizedTrain: number[][] = [];
let trainLabels: number[] = [];
let bounds: { min: number[]; max: number[] } = { min: [], max: [] };
let totalTrainSamples = 0;

/**
 * Convert PatientData (Firestore) → RawDatasetRow (preprocessing input).
 * PatientData punya string values, RawDatasetRow expects nullable values.
 */
function patientToRawRow(p: PatientData): RawDatasetRow {
  return {
    umur: p.umur,
    jenis_kelamin: p.jenis_kelamin,
    kelompok_populasi: p.kelompok_populasi,
    alasan_kunjungan: p.alasan_kunjungan,
    riwayat_tes_hiv: p.riwayat_tes_hiv,
    riwayat_ims: p.riwayat_ims,
    jumlah_pasangan_seksual: p.jumlah_pasangan_seksual,
    penggunaan_kondom: p.penggunaan_kondom,
    penggunaan_napza_suntik: p.penggunaan_napza_suntik,
    status_pernikahan: p.status_pernikahan,
    usia_pertama_hubungan: p.usia_pertama_hubungan,
    terapi_arv: p.terapi_arv,
    gejala_klinis: p.gejala_klinis,
    status_odhiv: p.status_odhiv,
  };
}

/**
 * Load training data dari Firestore, preprocess, dan normalisasi.
 * Harus dipanggil sebelum predict().
 */
export async function loadTrainingData(): Promise<void> {
  if (isReady) return;

  // 1. Fetch patients dari Firestore
  const patients = await getPatients();

  if (patients.length === 0) {
    throw new Error('Belum ada data pasien di Firestore. Import data seed terlebih dahulu.');
  }

  // 2. Convert ke RawDatasetRow format
  const rawDataset: RawDatasetRow[] = patients.map(patientToRawRow);

  // 3. Preprocessing: clean → encode → full pipeline
  const { encodedData } = runFullPreprocessing(rawDataset);

  // 4. SMOTE — balance classes
  const smoteData = smoteAllClasses(encodedData, 3, 42);

  // 5. Normalization
  bounds = getBounds(smoteData);
  normalizedTrain = normalizeDataset(smoteData, bounds);
  trainLabels = getLabels(smoteData);
  totalTrainSamples = smoteData.length;

  isReady = true;
}

/**
 * Reload training data dari Firestore (misal setelah import seed / tambah pasien).
 */
export async function reloadTrainingData(): Promise<void> {
  isReady = false;
  normalizedTrain = [];
  trainLabels = [];
  bounds = { min: [], max: [] };
  totalTrainSamples = 0;
  await loadTrainingData();
}

export function getTrainingStats() {
  return { totalSamples: totalTrainSamples, featureCount: 13, classLabels: CLASS_LABELS };
}

interface QueryFeatures {
  umur: number;
  jenis_kelamin: number;
  kelompok_populasi: number;
  alasan_kunjungan: number;
  riwayat_tes_hiv: number;
  riwayat_ims: number;
  jumlah_pasangan_seksual: number;
  penggunaan_kondom: number;
  penggunaan_napza_suntik: number;
  status_pernikahan: number;
  usia_pertama_hubungan: number;
  terapi_arv: number;
  gejala_klinis: number;
}

export interface PredictionResult {
  predictedClass: number;
  predictedLabel: string;
  confidence: number;
  neighbors: Array<{
    label: number;
    labelName: string;
    distance: number;
    rank: number;
    features: number[];
  }>;
  votes: Record<number, number>;
  votePercentages: Record<number, number>;
  queryRaw: number[];
  queryNormalized: number[];
  featureDistances: Array<{ feature: string; contribution: number }>;
  kUsed: number;
}

export function predict(features: QueryFeatures, k: number = 3): PredictionResult {
  if (!isReady) throw new Error('Training data belum dimuat');

  const queryRaw = [
    features.umur, features.jenis_kelamin, features.kelompok_populasi, features.alasan_kunjungan,
    features.riwayat_tes_hiv, features.riwayat_ims, features.jumlah_pasangan_seksual,
    features.penggunaan_kondom, features.penggunaan_napza_suntik, features.status_pernikahan,
    features.usia_pertama_hubungan, features.terapi_arv, features.gejala_klinis,
  ];

  const queryNorm = normalizeFeatureArray(queryRaw, bounds);

  const pred = knnPredictWithDetails(normalizedTrain, trainLabels, queryNorm, k);

  // Hitung confidence
  const totalVotes = Object.values(pred.voting).reduce((s, v) => s + v, 0);
  const confidence = totalVotes > 0 ? (pred.voting[pred.predictedLabel] || 0) / totalVotes : 0;

  // Hitung vote percentages
  const votePercentages: Record<number, number> = {};
  for (const [cls, count] of Object.entries(pred.voting)) {
    votePercentages[Number(cls)] = totalVotes > 0 ? count / totalVotes : 0;
  }

  // Hitung kontribusi tiap fitur ke jarak total
  const featureDistances = pred.neighbors[0]
    ? pred.neighbors[0].features.map((_, featIdx) => {
        const avgDist = pred.neighbors.reduce((s, n) => {
          const diff = queryNorm[featIdx] - n.features[featIdx];
          return s + diff * diff;
        }, 0) / pred.neighbors.length;
        return { feature: FEATURE_NAMES[featIdx], contribution: Math.sqrt(avgDist) };
      }).sort((a, b) => b.contribution - a.contribution)
    : [];

  return {
    predictedClass: pred.predictedLabel,
    predictedLabel: CLASS_LABELS[pred.predictedLabel] || 'Unknown',
    confidence,
    neighbors: pred.neighbors.map((n, i) => ({
      label: n.label,
      labelName: CLASS_LABELS[n.label] || 'Unknown',
      distance: n.distance,
      rank: i + 1,
      features: n.features,
    })),
    votes: pred.voting,
    votePercentages,
    queryRaw,
    queryNormalized: queryNorm,
    featureDistances,
    kUsed: k,
  };
}
