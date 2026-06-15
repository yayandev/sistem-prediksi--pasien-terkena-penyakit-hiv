/**
 * preprocessing.ts
 * ================
 * Implementasi manual 5 Tahap Preprocessing Data dari scratch.
 *
 * 13 Fitur Input:
 *   1. umur (numerik)
 *   2. jenis_kelamin (kategorikal)
 *   3. kelompok_populasi (kategorikal)
 *   4. alasan_kunjungan (kategorikal)
 *   5. riwayat_tes_hiv (kategorikal)
 *   6. riwayat_ims (kategorikal)
 *   7. jumlah_pasangan_seksual (numerik)
 *   8. penggunaan_kondom (kategorikal)
 *   9. penggunaan_napza_suntik (kategorikal)
 *   10. status_pernikahan (kategorikal)
 *   11. usia_pertama_hubungan (numerik)
 *   12. terapi_arv (kategorikal)
 *   13. gejala_klinis (kategorikal)
 *
 * Pipeline:
 *   Raw Data → Cleaning → LabelEncoder → Splitting → SMOTE → Normalisasi
 */

import type { DatasetRow } from './normalization';
import { smoteAllClasses } from './sMOTE';

// ============================================================
// TYPES
// ============================================================

export interface RawDatasetRow {
  umur: number | null;
  jenis_kelamin: string | null;
  kelompok_populasi: string | null;
  alasan_kunjungan: string | null;
  riwayat_tes_hiv: string | null;
  riwayat_ims: string | null;
  jumlah_pasangan_seksual: number | null;
  penggunaan_kondom: string | null;
  penggunaan_napza_suntik: string | null;
  status_pernikahan: string | null;
  usia_pertama_hubungan: number | null;
  terapi_arv: string | null;
  gejala_klinis: string | null;
  status_odhiv: string | null;
}

export interface PreprocessingReport {
  rawCount: number;
  cleanedCount: number;
  removedRows: number;
  encodingMaps: Record<string, Record<string, number>>;
  classDistributionBefore: Record<number, number>;
  classDistributionAfter: Record<number, number>;
  totalAfterSmote: number;
}

// ============================================================
// TAHAP 1: DATA CLEANING
// ============================================================

/**
 * Hapus baris dengan missing value (null) di SEMUA field.
 */
export function cleanData(rawData: RawDatasetRow[]): RawDatasetRow[] {
  return rawData.filter((row) => {
    return (
      row.umur !== null &&
      row.jenis_kelamin !== null &&
      row.kelompok_populasi !== null &&
      row.alasan_kunjungan !== null &&
      row.riwayat_tes_hiv !== null &&
      row.riwayat_ims !== null &&
      row.jumlah_pasangan_seksual !== null &&
      row.penggunaan_kondom !== null &&
      row.penggunaan_napza_suntik !== null &&
      row.status_pernikahan !== null &&
      row.usia_pertama_hubungan !== null &&
      row.terapi_arv !== null &&
      row.gejala_klinis !== null &&
      row.status_odhiv !== null
    );
  });
}

// ============================================================
// TAHAP 2: LABEL ENCODER
// ============================================================

/** Kolom kategorikal yang perlu di-encode */
const CATEGORICAL_COLUMNS = [
  'jenis_kelamin',
  'kelompok_populasi',
  'alasan_kunjungan',
  'riwayat_tes_hiv',
  'riwayat_ims',
  'penggunaan_kondom',
  'penggunaan_napza_suntik',
  'status_pernikahan',
  'terapi_arv',
  'gejala_klinis',
  'status_odhiv',
] as const;

/**
 * LabelEncoder — mengubah string kategorikal ke angka.
 * Mapping: sorted alphabetically → 0, 1, 2, ...
 */
export function labelEncode(cleanedData: RawDatasetRow[]): {
  encoded: DatasetRow[];
  maps: Record<string, Record<string, number>>;
} {
  // Kumpulkan unique values untuk setiap kolom kategorikal
  const maps: Record<string, Record<string, number>> = {};

  for (const col of CATEGORICAL_COLUMNS) {
    const uniqueValues = [...new Set(cleanedData.map((r) => r[col]!))].sort();
    maps[col] = {};
    uniqueValues.forEach((val, idx) => {
      maps[col][val] = idx;
    });
  }

  // Konversi setiap baris dari string ke angka
  const encoded: DatasetRow[] = cleanedData.map((row) => ({
    umur: row.umur!,
    jenis_kelamin: maps.jenis_kelamin[row.jenis_kelamin!],
    kelompok_populasi: maps.kelompok_populasi[row.kelompok_populasi!],
    alasan_kunjungan: maps.alasan_kunjungan[row.alasan_kunjungan!],
    riwayat_tes_hiv: maps.riwayat_tes_hiv[row.riwayat_tes_hiv!],
    riwayat_ims: maps.riwayat_ims[row.riwayat_ims!],
    jumlah_pasangan_seksual: row.jumlah_pasangan_seksual!,
    penggunaan_kondom: maps.penggunaan_kondom[row.penggunaan_kondom!],
    penggunaan_napza_suntik: maps.penggunaan_napza_suntik[row.penggunaan_napza_suntik!],
    status_pernikahan: maps.status_pernikahan[row.status_pernikahan!],
    usia_pertama_hubungan: row.usia_pertama_hubungan!,
    terapi_arv: maps.terapi_arv[row.terapi_arv!],
    gejala_klinis: maps.gejala_klinis[row.gejala_klinis!],
    status: maps.status_odhiv[row.status_odhiv!],
  }));

  return { encoded, maps };
}

// ============================================================
// PIPELINE LENGKAP
// ============================================================

/**
 * Menjalankan pipeline preprocessing LENGKAP dari data mentah.
 */
export function runFullPreprocessing(rawData: RawDatasetRow[]): {
  cleanedData: RawDatasetRow[];
  encodedData: DatasetRow[];
  encodingMaps: Record<string, Record<string, number>>;
  report: PreprocessingReport;
} {
  const cleanedData = cleanData(rawData);
  const removedRows = rawData.length - cleanedData.length;

  const { encoded, maps } = labelEncode(cleanedData);

  // SMOTE
  const smoteData = smoteAllClasses(encoded, 3, 42);

  const classDistributionBefore: Record<number, number> = {};
  for (const row of encoded) {
    classDistributionBefore[row.status] = (classDistributionBefore[row.status] || 0) + 1;
  }

  const classDistributionAfter: Record<number, number> = {};
  for (const row of smoteData) {
    classDistributionAfter[row.status] = (classDistributionAfter[row.status] || 0) + 1;
  }

  const report: PreprocessingReport = {
    rawCount: rawData.length,
    cleanedCount: cleanedData.length,
    removedRows,
    encodingMaps: maps,
    classDistributionBefore,
    classDistributionAfter,
    totalAfterSmote: smoteData.length,
  };

  return {
    cleanedData,
    encodedData: smoteData,
    encodingMaps: maps,
    report,
  };
}
