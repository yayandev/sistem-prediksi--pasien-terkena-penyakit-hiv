/**
 * runner.ts
 * =========
 * ML runner — loads training data, preprocesses it, trains KNN,
 * and exposes predict() for the Predictor component.
 */

import rawDataset from '../data/raw_hiv_dataset.json';
import { runFullPreprocessing } from '../utils/preprocessing';
import { normalizeDataset, normalizeFeatureArray, getBounds, getLabels } from '../utils/normalization';
import { smoteAllClasses } from '../utils/sMOTE';
import { knnPredictWithDetails } from '../utils/knn';

const CLASS_LABELS: Record<number, string> = {
  0: 'Belum Tahu',
  1: 'Bukan ODHIV',
  2: 'ODHIV',
};

let isReady = false;
let normalizedTrain: number[][] = [];
let trainLabels: number[] = [];
let bounds: { min: number[]; max: number[] } = { min: [], max: [] };

export async function loadTrainingData(): Promise<void> {
  if (isReady) return;

  // 1. Preprocessing: clean → encode → full pipeline
  const { encodedData } = runFullPreprocessing(rawDataset);

  // 2. SMOTE — balance classes
  const smoteData = smoteAllClasses(encodedData, 3, 42);

  // 3. Normalization
  bounds = getBounds(smoteData);
  normalizedTrain = normalizeDataset(smoteData, bounds);
  trainLabels = getLabels(smoteData);

  isReady = true;
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

export function predict(features: QueryFeatures) {
  if (!isReady) throw new Error('Training data belum dimuat');

  const queryRaw = [
    features.umur, features.jenis_kelamin, features.kelompok_populasi, features.alasan_kunjungan,
    features.riwayat_tes_hiv, features.riwayat_ims, features.jumlah_pasangan_seksual,
    features.penggunaan_kondom, features.penggunaan_napza_suntik, features.status_pernikahan,
    features.usia_pertama_hubungan, features.terapi_arv, features.gejala_klinis,
  ];

  const queryNorm = normalizeFeatureArray(queryRaw, bounds);
  const k = 3;

  const pred = knnPredictWithDetails(normalizedTrain, trainLabels, queryNorm, k);

  return {
    predictedClass: pred.predictedLabel,
    predictedLabel: CLASS_LABELS[pred.predictedLabel] || 'Unknown',
    neighbors: pred.neighbors.map((n, i) => ({
      label: n.label,
      distance: n.distance,
      rank: i + 1,
    })),
    votes: pred.voting,
  };
}
