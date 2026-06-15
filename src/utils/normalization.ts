/**
 * normalization.ts
 * ================
 * Implementasi manual Min-Max Normalization dari scratch.
 *
 * Rumus Matematika (Min-Max Normalization):
 *   x_normalized = (x - x_min) / (x_max - x_min)
 *
 * Di mana:
 *   x            = nilai fitur asli
 *   x_min        = nilai minimum fitur dalam dataset
 *   x_max        = nilai maximum fitur dalam dataset
 *   x_normalized = nilai setelah dinormalisasi (range [0, 1])
 *
 * Mengapa Normalisasi Diperlukan untuk KNN?
 *   - Euclidean Distance sensitif terhadap skala fitur
 *   - Contoh: Umur (21-62) vs Jenis Kelamin (0-1)
 *   - Tanpa normalisasi, umur akan mendominasi perhitungan jarak
 *     karena rentangnya jauh lebih besar
 *   - Min-Max Normalization memastikan semua fitur berada di range [0, 1]
 */

/**
 * Tipe data untuk setiap baris dataset.
 * Berisi 4 fitur + 1 label kelas.
 */
export type DatasetRow = {
  /** Usia pasien (range: 21-62) */
  umur: number;
  /** Jenis kelamin: 0 = Perempuan, 1 = Laki-laki */
  jenis_kelamin: number;
  /** Kelompok populasi: 0-5 (6 kategori) */
  kelompok_populasi: number;
  /** Alasan kunjungan: 0 = Tes HIV, 1 = Kunjungan Rutin PDP */
  alasan_kunjungan: number;
  /** Label kelas: 0 = Belum Tahu, 1 = Bukan ODHIV, 2 = ODHIV */
  status: number;
};

/**
 * Tipe data untuk batas minimum dan maksimum tiap fitur.
 * Digunakan dalam proses normalisasi.
 */
export type Bounds = {
  /** Array berisi nilai minimum untuk setiap fitur [umur, jk, kp, ak] */
  min: number[];
  /** Array berisi nilai maksimum untuk setiap fitur [umur, jk, kp, ak] */
  max: number[];
};

/**
 * Menghitung batas minimum dan maksimum untuk setiap fitur dalam dataset.
 *
 * Proses:
 *   1. Inisialisasi min dan max dari baris pertama dataset
 *   2. Iterasi SEMUA baris dataset
 *   3. Untuk setiap fitur, bandingkan dengan min/max saat ini
 *   4. Update min jika nilai lebih kecil, update max jika nilai lebih besar
 *
 * @param dataset - Array berisi semua baris data (23 baris)
 * @returns Bounds berisi array min dan max untuk 4 fitur
 * @throws Error jika dataset kosong
 */
export function getBounds(dataset: DatasetRow[]): Bounds {
  // Validasi: pastikan dataset tidak kosong
  if (dataset.length === 0) {
    throw new Error('Dataset kosong — tidak bisa menghitung bounds');
  }

  // Ambil baris pertama sebagai inisialisasi min dan max
  const firstRow = dataset[0];

  // Inisialisasi array min dan max dengan nilai dari baris pertama
  // Format: [umur, jenis_kelamin, kelompok_populasi, alasan_kunjungan]
  const min = [
    firstRow.umur,
    firstRow.jenis_kelamin,
    firstRow.kelompok_populasi,
    firstRow.alasan_kunjungan,
  ];

  // Max diinisialisasi dengan nilai yang sama (akan di-update nanti)
  const max = [...min];

  // Iterasi SEMUA baris dataset untuk mencari min dan max aktual
  for (const row of dataset) {
    // Ekstrak 4 fitur dari baris ini
    const features = [
      row.umur,
      row.jenis_kelamin,
      row.kelompok_populasi,
      row.alasan_kunjungan,
    ];

    // Bandingkan setiap fitur dengan min dan max saat ini
    for (let i = 0; i < features.length; i++) {
      // Jika nilai lebih kecil dari min, update min
      if (features[i] < min[i]) {
        min[i] = features[i];
      }
      // Jika nilai lebih besar dari max, update max
      if (features[i] > max[i]) {
        max[i] = features[i];
      }
    }
  }

  return { min, max };
}

/**
 * Melakukan normalisasi Min-Max pada satu vektor fitur.
 *
 * Rumus per fitur:
 *   x_normalized = (x - x_min) / (x_max - x_min)
 *
 * Kasus khusus:
 *   Jika x_max == x_min (semua nilai sama), return 0
 *   Ini mencegah division by zero
 *
 * @param features - Vektor fitur asli [umur, jk, kp, ak]
 * @param bounds   - Batas min dan max dari dataset training
 * @returns Vektor fitur yang sudah dinormalisasi (range [0, 1])
 */
export function normalizeFeatureArray(features: number[], bounds: Bounds): number[] {
  return features.map((val, i) => {
    // Hitung rentang (range) fitur ke-i
    // Rumus denominator: x_max - x_min
    const range = bounds.max[i] - bounds.min[i];

    // Kasus khusus: jika range = 0, return 0 (hindari division by zero)
    if (range === 0) return 0;

    // Terapkan rumus Min-Max Normalization:
    // x_normalized = (x - x_min) / (x_max - x_min)
    return (val - bounds.min[i]) / range;
  });
}

/**
 * Melakukan normalisasi Min-Max pada seluruh dataset.
 *
 * Proses:
 *   1. Untuk setiap baris dalam dataset
 *   2. Ekstrak 4 fitur [umur, jenis_kelamin, kelompok_populasi, alasan_kunjungan]
 *   3. Normalisasi menggunakan normalizeFeatureArray()
 *
 * @param dataset - Array berisi semua baris data
 * @param bounds  - Batas min dan max dari dataset training
 * @returns Array 2D berisi fitur yang sudah dinormalisasi
 */
export function normalizeDataset(dataset: DatasetRow[], bounds: Bounds): number[][] {
  return dataset.map(row => {
    // Ekstrak 4 fitur dari baris ini (tanpa label status)
    const features = [
      row.umur,
      row.jenis_kelamin,
      row.kelompok_populasi,
      row.alasan_kunjungan,
    ];

    // Normalisasi vektor fitur ini
    return normalizeFeatureArray(features, bounds);
  });
}

/**
 * Mengekstrak label kelas (status) dari dataset.
 *
 * Fungsi ini memisahkan fitur (X) dari label (Y).
 * Label digunakan untuk:
 *   - Training KNN (sebagai ground truth)
 *   - Evaluasi model (confusion matrix)
 *
 * @param dataset - Array berisi semua baris data
 * @returns Array berisi label kelas [0, 1, 2, ...]
 */
export function getLabels(dataset: DatasetRow[]): number[] {
  return dataset.map(row => row.status);
}
