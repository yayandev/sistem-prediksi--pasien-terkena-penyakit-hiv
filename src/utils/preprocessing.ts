/**
 * preprocessing.ts
 * ================
 * Implementasi manual 5 Tahap Preprocessing Data dari scratch.
 *
 * Sesuai Jurnal (halaman 128-130):
 *   Tahap 1: Data Cleaning — hapus missing value, hapus atribut tidak relevan
 *   Tahap 2: LabelEncoder — ubah string kategorikal ke numerik
 *   Tahap 3: Splitting Data — bagi 80% training, 20% testing
 *   Tahap 4: Penanganan Imbalance — SMOTETomek resampling
 *   Tahap 5: Normalisasi — Min-Max Normalization
 *
 * Pipeline lengkap:
 *   Raw Data (string) → Cleaning → LabelEncoder → Splitting → SMOTE → Normalisasi
 */

import type { DatasetRow } from './normalization';
import { smoteAllClasses } from './sMOTE';

// ============================================================
// TAPE 1: DATA CLEANING
// ============================================================

/**
 * Tipe data untuk baris dataset MENTAH (sebelum cleaning).
 * Field masih berupa string (kategorikal) dan bisa null.
 */
export interface RawDatasetRow {
  /** Usia pasien (angka) */
  umur: number | null;
  /** Jenis kelamin dalam bentuk string */
  jenis_kelamin: string | null;
  /** Kelompok populasi dalam bentuk string */
  kelompok_populasi: string | null;
  /** Alasan kunjungan dalam bentuk string */
  alasan_kunjungan: string | null;
  /** Status ODHIV dalam bentuk string */
  status_odhiv: string | null;
}

/**
 * Tipe data untuk laporan preprocessing.
 */
export interface PreprocessingReport {
  /** Jumlah data sebelum cleaning */
  rawCount: number;
  /** Jumlah data setelah cleaning (hapus null) */
  cleanedCount: number;
  /** Jumlah baris yang dihapus (missing values) */
  removedRows: number;
  /** Label yang ditemukan untuk Jenis Kelamin */
  jenisKelaminLabels: string[];
  /** Label yang ditemukan untuk Kelompok Populasi */
  kelompokPopulasiLabels: string[];
  /** Label yang ditemukan untuk Alasan Kunjungan */
  alasanKunjunganLabels: string[];
  /** Label yang ditemukan untuk Status ODHIV */
  statusLabels: string[];
  /** Mapping LabelEncoder untuk setiap kolom */
  encodingMaps: Record<string, Record<string, number>>;
  /** Jumlah data training */
  trainSize: number;
  /** Jumlah data testing */
  testSize: number;
  /** Distribusi kelas sebelum SMOTE */
  classDistributionBefore: Record<number, number>;
  /** Distribusi kelas sesudah SMOTE */
  classDistributionAfter: Record<number, number>;
  /** Total data setelah SMOTE */
  totalAfterSmote: number;
}

/**
 * Tahap 1: Data Cleaning — menghapus baris dengan missing value (null).
 *
 * Sesuai Jurnal (halaman 128):
 *   "Pada proses ini dilakukan pengecekan missing value,
 *    memastikan data tidak ada yang hilang."
 *
 *   "Dataset memiliki 2.205 baris dengan 5 kolom,
 *    dimana hanya kolom Kelompok Populasi yang memiliki 5 data yang hilang (null)."
 *
 * @param rawData - Dataset mentah dengan string dan null
 * @returns Dataset yang sudah dibersihkan (tanpa null)
 */
export function cleanData(rawData: RawDatasetRow[]): RawDatasetRow[] {
  // Filter: hanya ambil baris yang TIDAK memiliki null di SEMUA field
  return rawData.filter((row) => {
    return (
      row.umur !== null &&
      row.jenis_kelamin !== null &&
      row.kelompok_populasi !== null &&
      row.alasan_kunjungan !== null &&
      row.status_odhiv !== null
    );
  });
}

// ============================================================
// TAHAP 2: LABEL ENCODER
// ============================================================

/**
 * Melakukan LabelEncoder — mengubah string kategorikal ke angka.
 *
 * Sesuai Jurnal (halaman 129):
 *   "Pada machine learning data seperti ini tidak dapat diproses
 *    karena kolom labelnya yaitu berbentuk string atau termasuk
 *    kategorikal data, maka harus diubah menjadi data numerik
 *    dengan label encoder."
 *
 *   "LabelEncoder berfungsi untuk mengubah setiap nilai dalam
 *    kolom menjadi angka berurutan."
 *
 * Mapping (contoh dari jurnal):
 *   Negative = 0, Positive = 1
 *
 * Mapping kita (3 kelas):
 *   Belum Tahu = 0, Bukan ODHIV = 1, ODHIV = 2
 *
 * @param cleanedData - Dataset yang sudah dibersihkan
 * @returns Objek berisi encoded dataset dan mapping
 */
export function labelEncode(cleanedData: RawDatasetRow[]): {
  encoded: DatasetRow[];
  maps: Record<string, Record<string, number>>;
} {
  // Kumpulkan semua unik values untuk setiap kolom kategorikal
  const uniqueJenisKelamin = [...new Set(cleanedData.map(r => r.jenis_kelamin!))].sort();
  const uniqueKelompokPopulasi = [...new Set(cleanedData.map(r => r.kelompok_populasi!))].sort();
  const uniqueAlasanKunjungan = [...new Set(cleanedData.map(r => r.alasan_kunjungan!))].sort();
  const uniqueStatus = [...new Set(cleanedData.map(r => r.status_odhiv!))].sort();

  // Buat mapping: string → angka (berurutan)
  const maps: Record<string, Record<string, number>> = {
    jenis_kelamin: {},
    kelompok_populasi: {},
    alasan_kunjungan: {},
    status_odhiv: {},
  };

  uniqueJenisKelamin.forEach((val, idx) => {
    maps.jenis_kelamin[val] = idx;
  });

  uniqueKelompokPopulasi.forEach((val, idx) => {
    maps.kelompok_populasi[val] = idx;
  });

  uniqueAlasanKunjungan.forEach((val, idx) => {
    maps.alasan_kunjungan[val] = idx;
  });

  uniqueStatus.forEach((val, idx) => {
    maps.status_odhiv[val] = idx;
  });

  // Konversi setiap baris dari string ke angka
  const encoded: DatasetRow[] = cleanedData.map((row) => ({
    umur: row.umur!,
    jenis_kelamin: maps.jenis_kelamin[row.jenis_kelamin!],
    kelompok_populasi: maps.kelompok_populasi[row.kelompok_populasi!],
    alasan_kunjungan: maps.alasan_kunjungan[row.alasan_kunjungan!],
    status: maps.status_odhiv[row.status_odhiv!],
  }));

  return { encoded, maps };
}

// ============================================================
// TAHAP 5: NORMALISASI (dari normalization.ts)
// ============================================================

// Fungsi normalisasi sudah ada di normalization.ts
// getBounds(), normalizeDataset(), normalizeFeatureArray()

// ============================================================
// PIPELINE LENGKAP
// ============================================================

/**
 * Menjalankan pipeline preprocessing LENGKAP dari data mentah.
 *
 * Alur sesuai jurnal:
 *   1. Data Cleaning (hapus null)
 *   2. LabelEncoder (string → angka)
 *   3. Splitting Data (80/20)
 *   4. SMOTE (seimbangkan kelas)
 *   5. Normalisasi (Min-Max)
 *
 * @param rawData - Dataset mentah (dengan string dan null)
 * @returns Objek berisi semua tahapan preprocessing dan laporan
 */
export function runFullPreprocessing(rawData: RawDatasetRow[]): {
  cleanedData: RawDatasetRow[];
  encodedData: DatasetRow[];
  encodingMaps: Record<string, Record<string, number>>;
  report: PreprocessingReport;
} {
  // === TAHAP 1: DATA CLEANING ===
  const cleanedData = cleanData(rawData);

  // Hitung jumlah baris yang dihapus
  const removedRows = rawData.length - cleanedData.length;

  // === TAHAP 2: LABEL ENCODER ===
  const { encoded, maps } = labelEncode(cleanedData);

  // Kumpulkan label unik untuk laporan
  const jenisKelaminLabels = [...new Set(cleanedData.map(r => r.jenis_kelamin!))].sort();
  const kelompokPopulasiLabels = [...new Set(cleanedData.map(r => r.kelompok_populasi!))].sort();
  const alasanKunjunganLabels = [...new Set(cleanedData.map(r => r.alasan_kunjungan!))].sort();
  const statusLabels = [...new Set(cleanedData.map(r => r.status_odhiv!))].sort();

  // === TAHAP 4: SMOTE (sebelum normalisasi untuk menampilkan distribusi) ===
  const smoteData = smoteAllClasses(encoded, 3, 42);

  // Hitung distribusi kelas sebelum SMOTE
  const classDistributionBefore: Record<number, number> = {};
  for (const row of encoded) {
    classDistributionBefore[row.status] = (classDistributionBefore[row.status] || 0) + 1;
  }

  // Hitung distribusi kelas sesudah SMOTE
  const classDistributionAfter: Record<number, number> = {};
  for (const row of smoteData) {
    classDistributionAfter[row.status] = (classDistributionAfter[row.status] || 0) + 1;
  }

  // === BUAT LAPORAN ===
  const report: PreprocessingReport = {
    rawCount: rawData.length,
    cleanedCount: cleanedData.length,
    removedRows,
    jenisKelaminLabels,
    kelompokPopulasiLabels,
    alasanKunjunganLabels,
    statusLabels,
    encodingMaps: maps,
    trainSize: 0, // Akan diisi saat splitting
    testSize: 0,
    classDistributionBefore,
    classDistributionAfter,
    totalAfterSmote: smoteData.length,
  };

  return {
    cleanedData,
    encodedData: encoded,
    encodingMaps: maps,
    report,
  };
}
