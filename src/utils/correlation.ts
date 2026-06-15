/**
 * correlation.ts
 * ===============
 * Implementasi manual Pearson Correlation Coefficient dari scratch.
 *
 * Rumus Matematika:
 *
 *   r = Σ((xi - x̄)(yi - ȳ)) / √(Σ(xi - x̄)² × Σ(yi - ȳ)²)
 *
 *   Di mana:
 *     x̄ = rata-rata data x
 *     ȳ = rata-rata data y
 *     n = jumlah sampel
 *     r = koefisien korelasi Pearson
 *
 *   Interpretasi nilai r:
 *     r =  1.0  → korelasi positif sempurna (satu naik, lainnya naik)
 *     r =  0.5  → korelasi positif sedang
 *     r =  0.0  → tidak ada korelasi linear
 *     r = -0.5  → korelasi negatif sedang
 *     r = -1.0  → korelasi negatif sempurna (satu naik, lainnya turun)
 *
 * Referensi:
 *   Jurnal: "Status ODHIV dan Alasan Kunjungan adalah dua variabel yang
 *            paling berkaitan erat dalam dataset ini, sedangkan Umur
 *            hampir tidak memiliki pengaruh terhadap variabel lainnya."
 *
 *   Korelasi dari jurnal:
 *     Status ODHIV ↔ Alasan Kunjungan: -0.86 (sangat kuat, terbalik)
 *     Jenis Kelamin ↔ Status ODHIV: -0.30 (moderat)
 *     Jenis Kelamin ↔ Alasan Kunjungan: 0.30 (moderat)
 *     Umur ↔ Variabel lain: ~0 (hampir tidak berkorelasi)
 */

import type { DatasetRow } from './normalization';

/**
 * Menghitung Koefisien Korelasi Pearson antara dua array angka.
 *
 * Alur:
 *   1. Hitung rata-rata x (x̄) dan y (ȳ)
 *   2. Hitung pembilang: Σ((xi - x̄)(yi - ȳ))
 *   3. Hitung penyebut: √(Σ(xi - x̄)² × Σ(yi - ȳ)²)
 *   4. Bagi pembilang dengan penyebut
 *
 * @param x - Array angka pertama
 * @param y - Array angka kedua (panjangnya harus sama dengan x)
 * @returns Koefisien korelasi antara -1 dan 1
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  // Validasi: panjang array harus sama
  if (x.length !== y.length) {
    throw new Error(
      `Panjang array x (${x.length}) dan y (${y.length}) harus sama`
    );
  }

  if (x.length === 0) {
    throw new Error('Array tidak boleh kosong');
  }

  const n = x.length;

  // LANGKAH 1: Hitung rata-rata (mean) dari x dan y
  // Rumus: x̄ = Σ(xi) / n
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  // Rumus: ȳ = Σ(yi) / n
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  // LANGKAH 2: Hitung pembilang dan penyebut
  // Pembilang: Σ((xi - x̄)(yi - ȳ))
  let numerator = 0;
  // Penyebut bagian x: Σ(xi - x̄)²
  let sumSquaredDiffX = 0;
  // Penyebut bagian y: Σ(yi - ȳ)²
  let sumSquaredDiffY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;

    // Tambahkan ke pembilang
    numerator += diffX * diffY;

    // Tambahkan ke penyebut
    sumSquaredDiffX += diffX * diffX;
    sumSquaredDiffY += diffY * diffY;
  }

  // LANGKAH 3: Hitung denominator
  // Rumus: √(Σ(xi - x̄)² × Σ(yi - ȳ)²)
  const denominator = Math.sqrt(sumSquaredDiffX * sumSquaredDiffY);

  // Kasus khusus: jika denominator = 0, korelasi tidak terdefinisi
  // Ini terjadi jika salah satu array memiliki semua nilai sama
  if (denominator === 0) return 0;

  // LANGKAH 4: Hitung koefisien korelasi
  // Rumus: r = numerator / denominator
  return numerator / denominator;
}

/**
 * Mengekstrak kolom fitur dari dataset.
 *
 * @param dataset - Dataset asli
 * @param feature - Nama fitur yang ingin diekstrak
 * @returns Array angka dari kolom fitur tersebut
 */
function extractFeature(dataset: DatasetRow[], feature: keyof DatasetRow): number[] {
  return dataset.map(row => row[feature] as number);
}

/**
 * Tipe data untuk hasil korelasi antar dua fitur.
 */
export interface CorrelationPair {
  /** Nama fitur pertama */
  feature1: string;
  /** Nama fitur kedua */
  feature2: string;
  /** Nilai korelasi Pearson */
  correlation: number;
}

/**
 * Menghitung matriks korelasi untuk semua fitur dalam dataset.
 *
 * Fitur yang dihitung korelasinya:
 *   1. umur
 *   2. jenis_kelamin
 *   3. kelompok_populasi
 *   4. alasan_kunjungan
 *   5. status (label)
 *
 * @param dataset - Dataset asli
 * @returns Matriks korelasi (5×5) + daftar pasangan korelasi
 */
export function correlationMatrix(dataset: DatasetRow[]): {
  matrix: number[][];
  features: string[];
  pairs: CorrelationPair[];
} {
  const features = [
    'umur', 'jenis_kelamin', 'kelompok_populasi', 'alasan_kunjungan',
    'riwayat_tes_hiv', 'riwayat_ims', 'jumlah_pasangan_seksual',
    'penggunaan_kondom', 'penggunaan_napza_suntik', 'status_pernikahan',
    'usia_pertama_hubungan', 'terapi_arv', 'gejala_klinis', 'status',
  ];

  // Ekstrak kolom untuk setiap fitur
  const columns: number[][] = features.map(f =>
    extractFeature(dataset, f as keyof DatasetRow)
  );

  // Hitung matriks korelasi (5×5)
  const matrix: number[][] = [];
  const pairs: CorrelationPair[] = [];

  for (let i = 0; i < features.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < features.length; j++) {
      if (i === j) {
        // Korelasi dengan diri sendiri = 1
        matrix[i][j] = 1;
      } else if (j < i) {
        // Simetri: gunakan nilai yang sudah dihitung
        matrix[i][j] = matrix[j][i];
      } else {
        // Hitung korelasi Pearson antara fitur i dan j
        const r = pearsonCorrelation(columns[i], columns[j]);
        matrix[i][j] = r;

        // Simpan pasangan korelasi (hanya untuk i < j agar tidak duplikat)
        pairs.push({
          feature1: features[i],
          feature2: features[j],
          correlation: r,
        });
      }
    }
  }

  return { matrix, features, pairs };
}
