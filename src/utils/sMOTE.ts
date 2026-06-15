/**
 * sMOTE.ts
 * ========
 * Implementasi manual SMOTE (Synthetic Minority Over-sampling Technique) dari scratch.
 *
 * Konsep:
 *   SMOTE digunakan untuk mengatasi ketidakseimbangan kelas (class imbalance).
 *   Ketika salah satu kelas memiliki sangat sedikit data dibanding kelas lain,
 *   model KNN akan bias ke kelas mayoritas.
 *
 *   SMOTE bekerja dengan:
 *   1. Untuk setiap sampel kelas minoritas
 *   2. Cari K tetangga terdekat dari kelas YANG SAMA
 *   3. Pilih random 1 tetangga dari K tetangga
 *   4. Buat sampel sintetis dengan interpolasi linear:
 *
 *      x_sintetis = x_i + random(0, 1) × (x_nn - x_i)
 *
 *      Di mana:
 *        x_i       = sampel minoritas saat ini
 *        x_nn      = tetangga terdekat yang dipilih random
 *        random()  = angka random antara 0 dan 1
 *        x_sintetis = sampel baru hasil interpolasi
 *
 *   Interpolasi linear berarti sampel baru berada di "garis" antara
 *   x_i dan x_nn, dengan posisi acak di sepanjang garis tersebut.
 *
 * Referensi:
 *   Chawla, N.V. et al. (2002). "SMOTE: Synthetic Minority Over-sampling
 *   Technique" — Journal of Artificial Intelligence Research.
 *
 * Catatan:
 *   Tidak ada library JavaScript mature untuk SMOTETomek.
 *   Implementasi ini hanya SMOTE (tanpa Tomek Links) karena lebih sederhana
 *   dan sudah cukup untuk tujuan edukasi.
 */

import type { DatasetRow } from './normalization';
import { euclideanDistance } from './distance';

/** Extract all 13 features from a DatasetRow (without label) */
function extractFeatures(row: DatasetRow): number[] {
  return [
    row.umur,
    row.jenis_kelamin,
    row.kelompok_populasi,
    row.alasan_kunjungan,
    row.riwayat_tes_hiv,
    row.riwayat_ims,
    row.jumlah_pasangan_seksual,
    row.penggunaan_kondom,
    row.penggunaan_napza_suntik,
    row.status_pernikahan,
    row.usia_pertama_hubungan,
    row.terapi_arv,
    row.gejala_klinis,
  ];
}

/** Reconstruct a DatasetRow from feature array + label */
function toDatasetRow(features: number[], status: number): DatasetRow {
  return {
    umur: features[0],
    jenis_kelamin: features[1],
    kelompok_populasi: features[2],
    alasan_kunjungan: features[3],
    riwayat_tes_hiv: features[4],
    riwayat_ims: features[5],
    jumlah_pasangan_seksual: features[6],
    penggunaan_kondom: features[7],
    penggunaan_napza_suntik: features[8],
    status_pernikahan: features[9],
    usia_pertama_hubungan: features[10],
    terapi_arv: features[11],
    gejala_klinis: features[12],
    status,
  };
}

/**
 * Mencari K tetangga terdekat dari sebuah sampel
 * di antara sampel-sampel dengan kelas yang SAMA.
 *
 * @param sample     - Sampel yang ingin dicari tetangganya
 * @param sameClass  - Array sampel yang memiliki kelas sama
 * @param kNeighbors - Jumlah tetangga terdekat yang dicari
 * @returns Array K tetangga terdekat (tanpa sampel itu sendiri)
 */
function findKNearestSameClass(
  sample: number[],
  sameClass: number[][],
  kNeighbors: number
): number[][] {
  // Hitung jarak dari sample ke semua sampel lain di kelas yang sama
  const distances: { features: number[]; distance: number }[] = [];

  for (const other of sameClass) {
    // Pastikan bukan sampel yang sama (hindari jarak 0)
    if (other.every((v, i) => v === sample[i])) continue;

    distances.push({
      features: other,
      distance: euclideanDistance(sample, other),
    });
  }

  // Urutkan berdasarkan jarak terkecil
  distances.sort((a, b) => a.distance - b.distance);

  // Ambil K tetangga terdekat
  return distances.slice(0, kNeighbors).map(d => d.features);
}

/**
 * Menghasilkan satu sampel sintetis dari interpolasi linear
 * antara dua titik.
 *
 * Rumus:
 *   x_sintetis = x_i + random(0, 1) × (x_nn - x_i)
 *
 * @param point1 - Titik pertama (sampel asli)
 * @param point2 - Titik kedua (tetangga terdekat)
 * @param random - Fungsi random yang menghasilkan angka 0-1
 * @returns Sampel sintetis baru
 */
function interpolateLinear(
  point1: number[],
  point2: number[],
  random: () => number
): number[] {
  // random() menghasilkan angka antara 0 dan 1
  const alpha = random();

  // Interpolasi: x_new = x1 + alpha × (x2 - x1)
  return point1.map((v, i) => v + alpha * (point2[i] - v));
}

/**
 * Membuat PRNG (Pseudo-Random Number Generator) dari seed.
 * Menggunakan Linear Congruential Generator (LCG).
 *
 * @param seed - Angka awal
 * @returns Fungsi yang menghasilkan angka random 0-1
 */
function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (16807 * state) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/**
 * Melakukan SMOTE oversampling pada dataset.
 *
 * @param dataset      - Dataset asli
 * @param targetClass  - Label kelas yang ingin di-oversampling
 * @param kNeighbors   - Jumlah tetangga terdekat untuk SMOTE (default: 3)
 * @param seed         - Seed untuk reproducibility
 * @returns Dataset baru yang sudah di-oversampling
 */
export function smote(
  dataset: DatasetRow[],
  targetClass: number,
  kNeighbors: number = 3,
  seed: number = 42
): DatasetRow[] {
  const random = createSeededRandom(seed);

  // LANGKAH 1: Pisahkan data berdasarkan kelas
  const sameClass: number[][] = [];
  const otherClass: DatasetRow[] = [];

  for (const row of dataset) {
    const features = extractFeatures(row);

    if (row.status === targetClass) {
      sameClass.push(features);
    } else {
      otherClass.push(row);
    }
  }

  // LANGKAH 2: Hitung berapa banyak sampel sintetis yang dibutuhkan
  // Target: jumlah kelas minoritas = jumlah kelas mayoritas
  const maxClassSize = Math.max(
    sameClass.length,
    dataset.filter(r => r.status !== targetClass).length /
      (new Set(dataset.map(r => r.status)).size - 1)
  );

  // Hitung jumlah sampel sintetis yang perlu digenerate
  const samplesToGenerate = Math.max(0, maxClassSize - sameClass.length);

  // LANGKAH 3: Generate sampel sintetis
  const syntheticSamples: DatasetRow[] = [];

  for (let i = 0; i < samplesToGenerate; i++) {
    // Pilih random 1 sampel dari kelas minoritas
    const randomIndex = Math.floor(random() * sameClass.length);
    const sample = sameClass[randomIndex];

    // Cari K tetangga terdekat dari kelas yang sama
    const neighbors = findKNearestSameClass(sample, sameClass, kNeighbors);

    if (neighbors.length === 0) continue;

    // Pilih random 1 tetangga dari K tetangga
    const neighborIndex = Math.floor(random() * neighbors.length);
    const neighbor = neighbors[neighborIndex];

    // Generate sampel sintetis dengan interpolasi linear
    const syntheticFeatures = interpolateLinear(sample, neighbor, random);

    // Bulatkan fitur diskrit dan clamp ke range yang valid
    syntheticSamples.push(toDatasetRow(
      syntheticFeatures.map((v, i) => Math.round(v)),
      targetClass
    ));
  }

  // LANGKAH 4: Gabungkan data asli + sampel sintetis
  return [...dataset, ...syntheticSamples];
}

/**
 * Melakukan SMOTE pada SEMUA kelas minoritas dalam dataset.
 *
 * @param dataset   - Dataset asli
 * @param kNeighbors - Jumlah tetangga terdekat
 * @param seed      - Seed untuk reproducibility
 * @returns Dataset baru yang sudah di-oversampling semua kelasnya
 */
export function smoteAllClasses(
  dataset: DatasetRow[],
  kNeighbors: number = 3,
  seed: number = 42
): DatasetRow[] {
  // Hitung jumlah data per kelas
  const classCounts: Record<number, number> = {};
  for (const row of dataset) {
    classCounts[row.status] = (classCounts[row.status] || 0) + 1;
  }

  // Cari kelas dengan jumlah terbanyak
  const maxCount = Math.max(...Object.values(classCounts));

  // SMOTE untuk setiap kelas yang jumlahnya kurang dari max
  let result = [...dataset];
  let currentSeed = seed;

  for (const [classStr, count] of Object.entries(classCounts)) {
    const classLabel = parseInt(classStr, 10);
    if (count < maxCount) {
      result = smote(result, classLabel, kNeighbors, currentSeed);
      currentSeed += 1000; // Seed berbeda untuk setiap kelas
    }
  }

  return result;
}
