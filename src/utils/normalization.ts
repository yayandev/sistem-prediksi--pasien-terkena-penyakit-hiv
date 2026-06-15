/**
 * normalization.ts
 * ================
 * Implementasi manual Min-Max Normalization dari scratch.
 *
 * Rumus Matematika (Min-Max Normalization):
 *   x_normalized = (x - x_min) / (x_max - x_min)
 *
 * 13 Fitur Input + 1 Label:
 *   1. umur (numerik)
 *   2. jenis_kelamin (kategorikal → angka)
 *   3. kelompok_populasi (kategorikal → angka)
 *   4. alasan_kunjungan (kategorikal → angka)
 *   5. riwayat_tes_hiv (kategorikal → angka)
 *   6. riwayat_ims (kategorikal → angka)
 *   7. jumlah_pasangan_seksual (numerik)
 *   8. penggunaan_kondom (kategorikal → angka)
 *   9. penggunaan_napza_suntik (kategorikal → angka)
 *   10. status_pernikahan (kategorikal → angka)
 *   11. usia_pertama_hubungan (numerik)
 *   12. terapi_arv (kategorikal → angka)
 *   13. gejala_klinis (kategorikal → angka)
 */

/**
 * Tipe data untuk setiap baris dataset.
 * Berisi 13 fitur + 1 label kelas.
 */
export type DatasetRow = {
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
  status: number;
};

/** Jumlah fitur input (tanpa label) */
export const NUM_FEATURES = 13;

/** Nama-nama fitur untuk display */
export const FEATURE_NAMES = [
  'Usia',
  'Jenis Kelamin',
  'Kelompok Populasi',
  'Alasan Kunjungan',
  'Riwayat Tes HIV',
  'Riwayat IMS',
  'Jumlah Pasangan Seksual',
  'Penggunaan Kondom',
  'Penggunaan Napza Suntik',
  'Status Pernikahan',
  'Usia Pertama Hubungan',
  'Terapi ARV',
  'Gejala Klinis',
];

/**
 * Tipe data untuk batas minimum dan maksimum tiap fitur.
 */
export type Bounds = {
  min: number[];
  max: number[];
};

/**
 * Mengekstrak array fitur dari DatasetRow (tanpa label status).
 */
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

/**
 * Menghitung batas minimum dan maksimum untuk setiap fitur dalam dataset.
 */
export function getBounds(dataset: DatasetRow[]): Bounds {
  if (dataset.length === 0) {
    throw new Error('Dataset kosong — tidak bisa menghitung bounds');
  }

  const firstFeatures = extractFeatures(dataset[0]);
  const min = [...firstFeatures];
  const max = [...firstFeatures];

  for (const row of dataset) {
    const features = extractFeatures(row);
    for (let i = 0; i < features.length; i++) {
      if (features[i] < min[i]) min[i] = features[i];
      if (features[i] > max[i]) max[i] = features[i];
    }
  }

  return { min, max };
}

/**
 * Melakukan normalisasi Min-Max pada satu vektor fitur.
 */
export function normalizeFeatureArray(features: number[], bounds: Bounds): number[] {
  return features.map((val, i) => {
    const range = bounds.max[i] - bounds.min[i];
    if (range === 0) return 0;
    const normalized = (val - bounds.min[i]) / range;
    return Math.min(1, Math.max(0, normalized));
  });
}

/**
 * Melakukan normalisasi Min-Max pada seluruh dataset.
 */
export function normalizeDataset(dataset: DatasetRow[], bounds: Bounds): number[][] {
  return dataset.map(row => normalizeFeatureArray(extractFeatures(row), bounds));
}

/**
 * Mengekstrak label kelas (status) dari dataset.
 */
export function getLabels(dataset: DatasetRow[]): number[] {
  return dataset.map(row => row.status);
}
