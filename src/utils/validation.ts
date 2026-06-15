/**
 * validation.ts
 * ==============
 * Implementasi manual K-Fold Cross-Validation dari scratch.
 *
 * Konsep:
 *   Cross-Validation digunakan untuk mengevaluasi performa model secara
 *   lebih robust daripada hanya satu kali train/test split.
 *
 *   K-Fold Cross-Validation:
 *   1. Acak dataset
 *   2. Bagi menjadi K bagian (fold) yang sama besar
 *   3. Untuk setiap fold ke-i:
 *      a. Testing = fold ke-i
 *      b. Training = semua fold LAIN selain fold ke-i
 *      c. Latih model di training, evaluasi di testing
 *      d. Catat metrik fold ke-i
 *   4. Rata-rata metrik dari semua fold = hasil akhir
 *
 *   Keuntungan:
 *   - Setiap sampel pernah jadi testing (tidak ada yang terlewat)
 *   - Mengurangi variance dari satu kali split
 *   - Memberikan estimasi performa yang lebih stabil
 *
 * Referensi:
 *   Jurnal: "Optimasi parameter nilai K (tetangga terdekat) terhadap
 *            nilai f1-score menggunakan teknik Cross-Validation"
 */

import type { DatasetRow } from './normalization';
import { normalizeDataset, getLabels, getBounds, normalizeFeatureArray } from './normalization';
import { knnPredict } from './knn';
import { computeConfusionMatrix, computeMetrics } from './evaluation';
import { smoteAllClasses } from './sMOTE';

/**
 * Tipe data untuk satu fold dalam cross-validation.
 */
export interface FoldResult {
  /** Nomor fold (1-based) */
  foldNumber: number;
  /** Jumlah data training di fold ini */
  trainSize: number;
  /** Jumlah data testing di fold ini */
  testSize: number;
  /** Akurasi fold ini */
  accuracy: number;
  /** F1-Score (macro average) fold ini */
  f1Score: number;
  /** Precision (macro average) fold ini */
  precision: number;
  /** Recall (macro average) fold ini */
  recall: number;
}

/**
 * Tipe data untuk hasil cross-validation lengkap.
 */
export interface CrossValidationResult {
  /** Rata-rata akurasi dari semua fold */
  meanAccuracy: number;
  /** Rata-rata F1-Score dari semua fold */
  meanF1Score: number;
  /** Rata-rata Precision dari semua fold */
  meanPrecision: number;
  /** Rata-rata Recall dari semua fold */
  meanRecall: number;
  /** Standar deviasi akurasi */
  stdAccuracy: number;
  /** Standar deviasi F1-Score */
  stdF1Score: number;
  /** Detail hasil setiap fold */
  folds: FoldResult[];
  /** Nilai K yang digunakan */
  kValue: number;
}

/**
 * Menghitung standar deviasi dari sebuah array angka.
 *
 * Rumus:
 *   std = √( Σ(xi - x̄)² / n )
 *
 * Di mana:
 *   x̄ = rata-rata (mean)
 *   n  = jumlah data
 *
 * @param values - Array angka
 * @returns Standar deviasi
 */
function standardDeviation(values: number[]): number {
  const n = values.length;
  if (n === 0) return 0;

  // Hitung rata-rata (mean)
  const mean = values.reduce((sum, v) => sum + v, 0) / n;

  // Hitung Σ(xi - x̄)²
  const sumSquaredDifferences = values.reduce((sum, v) => {
    const diff = v - mean;
    return sum + diff * diff;
  }, 0);

  // Ambil akar kuadrat
  return Math.sqrt(sumSquaredDifferences / n);
}

/**
 * Melakukan K-Fold Cross-Validation pada model KNN.
 *
 * @param dataset - Dataset asli (23 baris)
 * @param kFolds  - Jumlah fold (biasanya 5 atau 10)
 * @param kNN     - Nilai K untuk KNN (jumlah tetangga terdekat)
 * @param seed    - Seed untuk pengacakan
 * @returns CrossValidationResult berisi rata-rata metrik + detail per fold
 */
export function kFoldCrossValidation(
  dataset: DatasetRow[],
  kFolds: number = 5,
  kNN: number = 3,
  seed: number = 42
): CrossValidationResult {
  // Validasi input
  if (dataset.length < kFolds) {
    throw new Error(
      `Jumlah data (${dataset.length}) harus lebih besar dari jumlah fold (${kFolds})`
    );
  }

  // LANGKAH 1: Acak dataset
  // Gunakan PRNG sederhana untuk reproducibility
  let state = seed;
  const random = () => {
    state = (16807 * state) % 2147483647;
    return (state - 1) / 2147483646;
  };

  // Fisher-Yates shuffle
  const shuffled = [...dataset];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  // LANGKAH 2: Bagi dataset menjadi K fold
  // Setiap fold berisi sekitar n/k sampel
  const foldSize = Math.floor(shuffled.length / kFolds);
  const folds: DatasetRow[][] = [];

  for (let i = 0; i < kFolds; i++) {
    const start = i * foldSize;
    // Fold terakhir mengambil sisa data
    const end = i === kFolds - 1 ? shuffled.length : start + foldSize;
    folds.push(shuffled.slice(start, end));
  }

  // LANGKAH 3: Untuk setiap fold, lakukan training dan testing
  const foldResults: FoldResult[] = [];

  for (let i = 0; i < kFolds; i++) {
    // Testing = fold ke-i
    const testFold = folds[i];

    // Training = semua fold KECUALI fold ke-i
    const trainFold: DatasetRow[] = [];
    for (let j = 0; j < kFolds; j++) {
      if (j !== i) {
        trainFold.push(...folds[j]);
      }
    }

    // Apply SMOTE ke data training saja (bukan testing!)
    const smoteTrainFold = smoteAllClasses(trainFold, 3, seed);

    // Normalisasi data
    // Bounds dihitung dari data training SETELAH SMOTE
    const bounds = getBounds(smoteTrainFold);
    const normalizedTrainX = normalizeDataset(smoteTrainFold, bounds);
    const trainY = getLabels(smoteTrainFold);

    const normalizedTestX = normalizeDataset(testFold, bounds);
    const testY = getLabels(testFold);

    // Prediksi setiap data testing
    const predictions: number[] = [];
    for (const query of normalizedTestX) {
      const pred = knnPredict(normalizedTrainX, trainY, query, kNN);
      predictions.push(pred);
    }

    // Hitung metrik fold ini
    const cm = computeConfusionMatrix(testY, predictions, 3);
    const metrics = computeMetrics(cm, 3);

    foldResults.push({
      foldNumber: i + 1,
      trainSize: trainFold.length,
      testSize: testFold.length,
      accuracy: metrics.accuracy,
      f1Score: metrics.macroF1Score,
      precision: metrics.macroPrecision,
      recall: metrics.macroRecall,
    });
  }

  // LANGKAH 4: Hitung rata-rata dan standar deviasi dari semua fold
  const accuracies = foldResults.map(f => f.accuracy);
  const f1Scores = foldResults.map(f => f.f1Score);
  const precisions = foldResults.map(f => f.precision);
  const recalls = foldResults.map(f => f.recall);

  return {
    meanAccuracy: accuracies.reduce((s, v) => s + v, 0) / kFolds,
    meanF1Score: f1Scores.reduce((s, v) => s + v, 0) / kFolds,
    meanPrecision: precisions.reduce((s, v) => s + v, 0) / kFolds,
    meanRecall: recalls.reduce((s, v) => s + v, 0) / kFolds,
    stdAccuracy: standardDeviation(accuracies),
    stdF1Score: standardDeviation(f1Scores),
    folds: foldResults,
    kValue: kNN,
  };
}

/**
 * Mencari nilai K optimal menggunakan Cross-Validation.
 *
 * Algoritma:
 *   1. Untuk setiap K dari 1 sampai maxK:
 *      a. Jalankan K-Fold Cross-Validation dengan K tersebut
 *      b. Catat rata-rata F1-Score
 *   2. Pilih K dengan F1-Score tertinggi
 *
 * @param dataset - Dataset asli
 * @param maxK    - Nilai K maksimum yang diuji
 * @param kFolds  - Jumlah fold untuk cross-validation
 * @param seed    - Seed untuk reproducibility
 * @returns Object berisi K optimal, semua hasil K, dan grafik data
 */
export function findOptimalK(
  dataset: DatasetRow[],
  maxK: number = 15,
  kFolds: number = 5,
  seed: number = 42
): {
  optimalK: number;
  results: { k: number; f1Score: number; accuracy: number }[];
  optimalF1Score: number;
} {
  const results: { k: number; f1Score: number; accuracy: number }[] = [];
  let optimalK = 1;
  let optimalF1Score = 0;

  // Uji setiap K dari 1 sampai maxK
  for (let k = 1; k <= maxK; k++) {
    const cv = kFoldCrossValidation(dataset, kFolds, k, seed);

    results.push({
      k,
      f1Score: cv.meanF1Score,
      accuracy: cv.meanAccuracy,
    });

    // Jika F1-Score K ini lebih tinggi, jadikan K optimal
    if (cv.meanF1Score > optimalF1Score) {
      optimalF1Score = cv.meanF1Score;
      optimalK = k;
    }
  }

  return { optimalK, results, optimalF1Score };
}
