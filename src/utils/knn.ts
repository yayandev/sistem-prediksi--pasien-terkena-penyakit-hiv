/**
 * knn.ts
 * ======
 * Implementasi manual K-Nearest Neighbors (KNN) dari scratch.
 *
 * Rumus Matematika / Langkah Algoritma:
 *   1. Hitung jarak Euclidean(x_baru, x_i) untuk SEMUA data training i
 *   2. Urutkan hasil jarak dari terkecil ke terbesar (ascending)
 *   3. Ambil K tetangga terdekat (K tetangga dengan jarak terkecil)
 *   4. Hitung frekuensi kelas di antara K tetangga (majority voting)
 *   5. Kelas dengan frekuensi tertinggi = hasil prediksi
 *
 *   Jika ada tie (beberapa kelas jumlahnya sama):
 *     → Pilih kelas yang memiliki total jarak paling kecil dari query
 *
 * Referensi:
 *   - Cover, T. & Hart, P. (1967). "Nearest neighbor pattern classification"
 *   - K optimal ≈ √(n) di mana n = jumlah data training
 */

import { euclideanDistance } from './distance';

/**
 * Tipe data untuk satu tetangga terdekat yang ditemukan.
 * Berisi informasi lengkap tentang tetangga dan jaraknya.
 */
export interface Neighbor {
  /** Index asli di data training */
  index: number;
  /** Nilai fitur tetangga (sudah dinormalisasi) */
  features: number[];
  /** Label/kelas tetangga (0, 1, atau 2) */
  label: number;
  /** Jarak Euclidean dari query ke tetangga ini */
  distance: number;
}

/**
 * Tipe data hasil prediksi KNN.
 * Berisi hasil klasifikasi beserta detail tetangga dan voting.
 */
export interface PredictionResult {
  /** Label hasil prediksi (0: Belum Tahu, 1: Bukan ODHIV, 2: ODHIV) */
  predictedLabel: number;
  /** Daftar K tetangga terdekat */
  neighbors: Neighbor[];
  /** Frekuensi voting tiap kelas { label: jumlah } */
  voting: Record<number, number>;
}

/**
 * Melakukan prediksi menggunakan algoritma K-Nearest Neighbors (KNN).
 *
 * Alur kerja:
 *   1. Untuk setiap data training, hitung jarak Euclidean ke input query
 *   2. Urutkan semua data training berdasarkan jarak (ascending)
 *   3. Ambil K data terdekat
 *   4. Hitung majority voting di antara K tetangga
 *   5. Return kelas dengan suara terbanyak
 *
 * @param trainingX - Data training (fitur yang sudah dinormalisasi)
 * @param trainingY - Label data training (0, 1, atau 2)
 * @param query     - Input user yang sudah dinormalisasi
 * @param k         - Jumlah tetangga terdekat yang dipertimbangkan
 * @returns PredictionResult berisi prediksi, tetangga, dan detail voting
 */
export function knnPredictWithDetails(
  trainingX: number[][],
  trainingY: number[],
  query: number[],
  k: number
): PredictionResult {
  // === LANGKAH 1: Hitung jarak dari query ke SEMUA data training ===
  // Setiap data training memiliki jarak yang berbeda ke query
  const distances: Neighbor[] = trainingX.map((features, index) => ({
    index,
    features,
    label: trainingY[index],
    distance: euclideanDistance(query, features),
  }));

  // === LANGKAH 2: Urutkan berdasarkan jarak terkecil (ascending) ===
  // Tetangga terdekat (jarak terkecil) ada di indeks paling awal
  distances.sort((a, b) => a.distance - b.distance);

  // === LANGKAH 3: Ambil K tetangga terdekat ===
  // Slice array untuk mengambil K elemen pertama (jarak terkecil)
  const neighbors = distances.slice(0, k);

  // === LANGKAH 4: Majority Voting ===
  // Hitung berapa kali muncul setiap kelas di antara K tetangga
  const voting: Record<number, number> = {};

  for (const neighbor of neighbors) {
    const label = neighbor.label;
    // Jika kelas belum ada di objek voting, inisialisasi dengan 0
    if (!(label in voting)) {
      voting[label] = 0;
    }
    // Tambah 1 suara untuk kelas ini
    voting[label]++;
  }

  // === LANGKAH 5: Tentukan kelas pemenang ===
  // Cari kelas dengan jumlah suara terbanyak
  let maxVotes = 0;
  let predictedLabel = 0;

  for (const [labelStr, votes] of Object.entries(voting)) {
    const label = parseInt(labelStr, 10);

    if (votes > maxVotes) {
      // Jika kelas ini punya suara lebih banyak, jadikan pemenang sementara
      maxVotes = votes;
      predictedLabel = label;
    } else if (votes === maxVotes) {
      // === TIE-BREAKING ===
      // Jika jumlah suara sama, pilih kelas yang memiliki total jarak lebih kecil
      // Hitung total jarak tetangga yang memilih kelas ini
      const totalDistanceOfClass = neighbors
        .filter(n => n.label === label)
        .reduce((sum, n) => sum + n.distance, 0);

      const totalDistanceOfCurrentWinner = neighbors
        .filter(n => n.label === predictedLabel)
        .reduce((sum, n) => sum + n.distance, 0);

      // Jika total jarak kelas ini lebih kecil, jadikan pemenang baru
      if (totalDistanceOfClass < totalDistanceOfCurrentWinner) {
        predictedLabel = label;
      }
    }
  }

  return { predictedLabel, neighbors, voting };
}

/**
 * Fungsi sederhana untuk prediksi KNN.
 * Hanya mengembalikan label prediksi tanpa detail.
 *
 * @param trainingX - Data training (fitur)
 * @param trainingY - Label data training
 * @param query     - Input yang sudah dinormalisasi
 * @param k         - Jumlah tetangga terdekat
 * @returns Label hasil prediksi (0, 1, atau 2)
 */
export function knnPredict(
  trainingX: number[][],
  trainingY: number[],
  query: number[],
  k: number
): number {
  return knnPredictWithDetails(trainingX, trainingY, query, k).predictedLabel;
}
