/**
 * evaluation.ts
 * ==============
 * Implementasi manual Confusion Matrix dan Metrik Evaluasi dari scratch.
 *
 * Confusion Matrix:
 *   Matriks 3×3 (untuk 3 kelas) yang menunjukkan:
 *   - Baris = label AKTUAL (ground truth)
 *   - Kolom = label PREDIKSI (hasil model)
 *   - Sel (i, j) = jumlah sampel aktual kelas i yang diprediksi sebagai kelas j
 *
 * Rumus Metrik:
 *
 *   TP (True Positive)  = prediksi benar untuk kelas tersebut
 *   FP (False Positive) = prediksi salah (lain kelas dikatakan kelas ini)
 *   FN (False Negative) = prediksi salah (kelas ini dikatakan lain kelas)
 *   TN (True Negative)  = prediksi benar untuk kelas lain
 *
 *   Precision = TP / (TP + FP)
 *     → "Dari semua yang diprediksi kelas X, berapa yang benar?"
 *
 *   Recall = TP / (TP + FN)
 *     → "Dari semua yang aktualnya kelas X, berapa yang berhasil ditemukan?"
 *
 *   F1-Score = 2 × (Precision × Recall) / (Precision + Recall)
 *     → Harmonic mean dari Precision dan Recall
 *
 *   Accuracy = Σ(TP semua kelas) / Total sampel
 *     → "Berapa persen prediksi yang benar secara keseluruhan?"
 *
 *   Macro Average = rata-rata metrik dari semua kelas
 *     → Memberikan bobot yang SAMA untuk setiap kelas
 */

import { knnPredict } from './knn';
import { normalizeDataset, getLabels, getBounds, normalizeFeatureArray } from './normalization';
import { trainTestSplit } from './splitting';
import { smoteAllClasses } from './sMOTE';
import type { DatasetRow } from './normalization';

/**
 * Tipe data untuk metrik per kelas.
 */
export interface PerClassMetric {
  /** Label kelas (0, 1, atau 2) */
  label: number;
  /** Nama kelas */
  name: string;
  /** True Positive */
  tp: number;
  /** False Positive */
  fp: number;
  /** False Negative */
  fn: number;
  /** Precision = TP / (TP + FP) */
  precision: number;
  /** Recall = TP / (TP + FN) */
  recall: number;
  /** F1-Score = 2 × (P × R) / (P + R) */
  f1Score: number;
}

/**
 * Tipe data untuk hasil evaluasi lengkap.
 */
export interface EvaluationResult {
  /** Confusion Matrix 3×3 */
  confusionMatrix: number[][];
  /** Akurasi keseluruhan */
  accuracy: number;
  /** Rata-rata precision dari semua kelas */
  macroPrecision: number;
  /** Rata-rata recall dari semua kelas */
  macroRecall: number;
  /** Rata-rata F1-score dari semua kelas */
  macroF1Score: number;
  /** Detail metrik per kelas */
  perClass: PerClassMetric[];
  /** Label kelas */
  classLabels: string[];
}

/**
 * Nama-nama kelas untuk HIV classification.
 */
const CLASS_LABELS = ['Belum Tahu', 'Bukan ODHIV', 'ODHIV'];

/**
 * Menghitung Confusion Matrix dari label aktual dan prediksi.
 *
 * Rumus:
 *   CM[i][j] = jumlah sampel yang aktualnya kelas i
 *              tapi diprediksi sebagai kelas j
 *
 * @param actual      - Array label aktual (ground truth)
 * @param predicted   - Array label prediksi dari model
 * @param numClasses  - Jumlah kelas (3 untuk HIV: 0, 1, 2)
 * @returns Confusion Matrix sebagai array 2D (numClasses × numClasses)
 */
export function computeConfusionMatrix(
  actual: number[],
  predicted: number[],
  numClasses: number
): number[][] {
  // Validasi: jumlah aktual dan prediksi harus sama
  if (actual.length !== predicted.length) {
    throw new Error(
      `Panjang aktual (${actual.length}) dan prediksi (${predicted.length}) harus sama`
    );
  }

  // Inisialisasi matriks 2D dengan semua 0
  // Baris = aktual, Kolom = prediksi
  const cm: number[][] = [];
  for (let i = 0; i < numClasses; i++) {
    cm[i] = [];
    for (let j = 0; j < numClasses; j++) {
      cm[i][j] = 0;
    }
  }

  // Isi confusion matrix
  // Untuk setiap sampel, tambahkan 1 ke sel (aktual, prediksi)
  for (let k = 0; k < actual.length; k++) {
    const a = actual[k]; // label aktual
    const p = predicted[k]; // label prediksi
    cm[a][p]++;
  }

  return cm;
}

/**
 * Menghitung metrik evaluasi dari Confusion Matrix.
 *
 * @param cm         - Confusion Matrix (numClasses × numClasses)
 * @param numClasses - Jumlah kelas (3 untuk HIV)
 * @returns EvaluationResult berisi accuracy, macro averages, dan per-class metrics
 */
export function computeMetrics(cm: number[][], numClasses: number): EvaluationResult {
  // === HITUNG TP, FP, FN UNTUK SETIAP KELAS ===
  const perClass: PerClassMetric[] = [];

  for (let i = 0; i < numClasses; i++) {
    // TP = diagonal matriks (prediksi benar untuk kelas i)
    // Rumus: TP_i = CM[i][i]
    const tp = cm[i][i];

    // FP = total kolom i MINUS TP
    // "Semua yang diprediksi kelas i" dikurangi "yang benar-benar kelas i"
    // Rumus: FP_i = Σ(CM[j][i]) - CM[i][i]
    let fp = 0;
    for (let j = 0; j < numClasses; j++) {
      fp += cm[j][i];
    }
    fp -= tp;

    // FN = total baris i MINUS TP
    // "Semua yang aktualnya kelas i" dikurangi "yang berhasil ditemukan"
    // Rumus: FN_i = Σ(CM[i][j]) - CM[i][i]
    let fn = 0;
    for (let j = 0; j < numClasses; j++) {
      fn += cm[i][j];
    }
    fn -= tp;

    // === HITUNG METRIK PER KELAS ===

    // Precision = TP / (TP + FP)
    // Kasus khusus: jika TP + FP = 0, precision = 0
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;

    // Recall = TP / (TP + FN)
    // Kasus khusus: jika TP + FN = 0, recall = 0
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;

    // F1-Score = 2 × (Precision × Recall) / (Precision + Recall)
    // Kasus khusus: jika Precision + Recall = 0, F1 = 0
    const f1Score =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0;

    perClass.push({
      label: i,
      name: CLASS_LABELS[i] || `Kelas ${i}`,
      tp,
      fp,
      fn,
      precision,
      recall,
      f1Score,
    });
  }

  // === HITUNG AKURASI KESELURUHAN ===
  // Accuracy = Σ(TP semua kelas) / Total sampel
  // Rumus: Accuracy = Σ(CM[i][i]) / Σ(CM[i][j])
  let totalCorrect = 0;
  let totalSamples = 0;
  for (let i = 0; i < numClasses; i++) {
    for (let j = 0; j < numClasses; j++) {
      if (i === j) totalCorrect += cm[i][j];
      totalSamples += cm[i][j];
    }
  }
  const accuracy = totalSamples > 0 ? totalCorrect / totalSamples : 0;

  // === HITUNG MACRO AVERAGE ===
  // Macro Average = rata-rata metrik dari semua kelas
  // Memberikan bobot yang SAMA untuk setiap kelas (tidak memperhatikan jumlah sampel)
  const macroPrecision =
    perClass.reduce((sum, m) => sum + m.precision, 0) / numClasses;
  const macroRecall =
    perClass.reduce((sum, m) => sum + m.recall, 0) / numClasses;
  const macroF1Score =
    perClass.reduce((sum, m) => sum + m.f1Score, 0) / numClasses;

  return {
    confusionMatrix: cm,
    accuracy,
    macroPrecision,
    macroRecall,
    macroF1Score,
    perClass,
    classLabels: CLASS_LABELS.slice(0, numClasses),
  };
}

/**
 * Melakukan evaluasi lengkap model KNN pada dataset.
 *
 * Alur:
 *   1. Split dataset menjadi training (80%) dan testing (20%)
 *   2. Normalisasi data training dan testing
 *   3. Latih KNN pada data training
 *   4. Prediksi data testing
 *   5. Hitung confusion matrix dan semua metrik
 *
 * @param dataset  - Dataset asli (23 baris)
 * @param k        - Jumlah tetangga terdekat untuk KNN
 * @param seed     - Seed untuk train/test split
 * @returns EvaluationResult berisi hasil evaluasi lengkap
 */
export function evaluateModel(
  dataset: DatasetRow[],
  k: number,
  seed: number = 42
): EvaluationResult {
  // LANGKAH 1: Split dataset menjadi training dan testing
  const { train, test } = trainTestSplit(dataset, 0.2, seed);

  // LANGKAH 2: Apply SMOTE ke data training saja (bukan testing!)
  // SMOTE menyeimbangkan kelas minoritas dengan data sintetis
  const smoteTrain = smoteAllClasses(train, 3, seed);

  // LANGKAH 3: Normalisasi data
  // Bounds dihitung dari data training SETELAH SMOTE
  const bounds = getBounds(smoteTrain);
  const normalizedTrainX = normalizeDataset(smoteTrain, bounds);
  const trainY = getLabels(smoteTrain);

  // Data testing dinormalisasi dengan bounds dari training
  const normalizedTestX = normalizeDataset(test, bounds);
  const testY = getLabels(test);

  // LANGKAH 4: Prediksi setiap data testing menggunakan KNN
  const predictions: number[] = [];
  for (const query of normalizedTestX) {
    const pred = knnPredict(normalizedTrainX, trainY, query, k);
    predictions.push(pred);
  }

  // LANGKAH 5: Hitung confusion matrix dan metrik
  const numClasses = 3;
  const cm = computeConfusionMatrix(testY, predictions, numClasses);
  return computeMetrics(cm, numClasses);
}
