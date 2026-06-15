/**
 * splitting.ts
 * =============
 * Implementasi manual Train/Test Split dari scratch.
 *
 * Konsep:
 *   Dataset dibagi menjadi 2 bagian:
 *   - Training data (80%) → digunakan untuk melatih model KNN
 *   - Testing data (20%)  → digunakan untuk mengevaluasi performa model
 *
 *   Penting: Data testing TIDAK BOLEH digunakan saat training.
 *   Ini mencegah "data leakage" (kebocoran informasi).
 *
 * Metode:
 *   1. Acak dataset menggunakan Fisher-Yates Shuffle dengan seed tetap
 *   2. Bagi menjadi training (80%) dan testing (20%)
 *   3. Seed tetap memastikan hasil split reproducible (bisa diulang)
 *
 * Referensi:
 *   Jurnal: "20% dari data digunakan untuk testing, sedangkan
 *            80% sisanya digunakan untuk training"
 */

import type { DatasetRow } from './normalization';

/**
 * Fungsi untuk menghasilkan angka random dari seed menggunakan PRNG sederhana.
 * Menggunakan Linear Congruential Generator (LCG):
 *   next = (a * current + c) mod m
 *
 * @param seed - Angka awal untuk menghasilkan seed
 * @returns Fungsi yang menghasilkan angka random antara 0 dan 1
 */
function createSeededRandom(seed: number) {
  // Parameter LCG (Lehmer/Park-Miller):
  // a = 16807 (multiplier)
  // m = 2^31 - 1 = 2147483647 (modulus, prima Mersenne)
  // c = 0 (additive)
  let state = seed;
  return () => {
    state = (16807 * state) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/**
 * Fisher-Yates Shuffle — mengacak urutan array secara in-place.
 *
 * Algoritma:
 *   1. Mulai dari indeks terakhir array
 *   2. Pilih indeks random dari 0 sampai indeks saat ini
 *   3. Tukar elemen di kedua indeks
 *   4. Ulangi sampai indeks 0
 *
 * Kompleksitas: O(n) — sangat efisien
 *
 * @param array - Array yang akan diacak (dimodifikasi in-place)
 * @param random - Fungsi random dari PRNG
 */
function fisherYatesShuffle<T>(array: T[], random: () => number): void {
  // Mulai dari indeks terakhir
  for (let i = array.length - 1; i > 0; i--) {
    // Pilih indeks random dari 0 sampai i (inklusif)
    const j = Math.floor(random() * (i + 1));

    // Tukar elemen di indeks i dan j
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

/**
 * Membagi dataset menjadi training data dan testing data.
 *
 * @param dataset   - Dataset asli (23 baris untuk HIV dataset)
 * @param testSize  - Proporsi data testing (0.2 = 20%)
 * @param seed      - Seed untuk pengacakan (memastikan hasil reproducible)
 * @returns Object berisi { train, test } — masing-masing array DatasetRow
 *
 * Contoh:
 *   const { train, test } = trainTestSplit(hivDataset, 0.2, 42);
 *   // train = 18 baris (80%)
 *   // test = 5 baris (20%)
 */
export function trainTestSplit(
  dataset: DatasetRow[],
  testSize: number = 0.2,
  seed: number = 42
): { train: DatasetRow[]; test: DatasetRow[] } {
  // Validasi input
  if (dataset.length === 0) {
    throw new Error('Dataset kosong — tidak bisa melakukan split');
  }

  if (testSize <= 0 || testSize >= 1) {
    throw new Error(`testSize harus antara 0 dan 1 (exclusive), diterima: ${testSize}`);
  }

  // LANGKAH 1: Buat salinan dataset agar tidak mengubah data asli
  const shuffled = [...dataset];

  // LANGKAH 2: Acak dataset menggunakan Fisher-Yates Shuffle
  const random = createSeededRandom(seed);
  fisherYatesShuffle(shuffled, random);

  // LANGKAH 3: Hitung titik split
  // Rumus: splitIndex = floor(n × (1 - testSize))
  // Contoh: 23 × 0.8 = 18.4 → floor = 18 → training = 18 baris
  const splitIndex = Math.floor(shuffled.length * (1 - testSize));

  // LANGKAH 4: Bagi menjadi training dan testing
  const train = shuffled.slice(0, splitIndex); // 0 sampai splitIndex-1
  const test = shuffled.slice(splitIndex);      // splitIndex sampai akhir

  return { train, test };
}
