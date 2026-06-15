/**
 * Predictor.tsx
 * =============
 * Komponen formulir prediksi risiko HIV menggunakan algoritma KNN custom.
 *
 * Alur Kerja (Pipeline Lengkap sesuai Jurnal):
 *   1. User mengisi form (usia, jenis kelamin, kelompok populasi, alasan kunjungan)
 *   2. Data mentah → Data Cleaning (hapus null) → LabelEncoder (string → angka)
 *   3. Normalisasi input user menggunakan Min-Max Normalization
 *   4. Sistem menjalankan KNN custom (tanpa library external)
 *   5. Sistem menampilkan hasil prediksi (0: Belum Tahu, 1: Bukan ODHIV, 2: ODHIV)
 *
 * Catatan: Tidak ada library ML external yang digunakan.
 *          Semua algoritma diimplementasi dari scratch dengan komentar penjelasan.
 */

import React, { useState, useMemo } from 'react';
// Import pipeline preprocessing (Cleaning + LabelEncoder)
import { runFullPreprocessing } from '../utils/preprocessing';
// Import normalisasi dari scratch
import { getBounds, normalizeFeatureArray, normalizeDataset, getLabels } from '../utils/normalization';
// Import KNN custom dari scratch (BUKAN ml-knn)
import { knnPredict, knnPredictWithDetails } from '../utils/knn';
// Import dataset MENTAH (dengan string dan null) — bukan yang sudah clean
import rawDataset from '../data/raw_hiv_dataset.json';
// Import icon Lucide
import { AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

/**
 * Komponen Predictor — form asesmen risiko HIV + hasil prediksi KNN.
 */
export default function Predictor() {
  // State untuk menyimpan nilai form
  const [umur, setUmur] = useState<string>('');
  const [jenisKelamin, setJenisKelamin] = useState<string>('Laki-laki');
  const [kelompokPopulasi, setKelompokPopulasi] = useState<string>('Populasi Umum');
  const [alasanKunjungan, setAlasanKunjungan] = useState<string>('Tes HIV');
  // State untuk menyimpan hasil prediksi (null = belum diprediksi)
  const [prediction, setPrediction] = useState<number | null>(null);
  // State untuk menyimpan detail prediksi (tetangga, voting, dll)
  const [predictionDetail, setPredictionDetail] = useState<{
    neighbors: { label: number; distance: number }[];
    voting: Record<number, number>;
    pipeline: { raw: string[]; cleaned: string[]; encoded: number[]; normalized: number[] };
  } | null>(null);

  // === JALANKAN PREPROCESSING PIPELINE DARI RAW DATA ===
  // useMemo agar hanya dijalankan sekali
  const { cleanedData, encodedData, encodingMaps } = useMemo(() => {
    return runFullPreprocessing(rawDataset);
  }, []);

  // Hitung bounds dari data yang sudah di-smote untuk training
  // (Untuk prediksi, kita gunakan bounds dari encodedData saja)
  const bounds = useMemo(() => {
    return getBounds(encodedData);
  }, [encodedData]);

  /**
   * Handler saat form disubmit — menjalankan pipeline KNN dari scratch.
   *
   * Alur:
   *   1. Parse input user ke integer
   *   2. Proses input: Cleaning → LabelEncoder → Normalisasi
   *   3. Jalankan KNN custom dengan K=3
   *   4. Tampilkan hasil prediksi
   */
  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();

    // === LANGKAH 1: Parse input user ===
    const umurNum = parseInt(umur, 10);

    // Validasi: pastikan usia adalah angka yang valid
    if (isNaN(umurNum)) {
      alert('Harap masukkan nilai numerik yang valid untuk Usia.');
      return;
    }

    // === LANGKAH 2: Pipeline Input User ===
    // Tahap 1: Input user (sudah dalam format bersih, tidak ada null)
    const rawInput = [String(umurNum), jenisKelamin, kelompokPopulasi, alasanKunjungan];

    // Tahap 2: LabelEncoder — konversi string ke angka menggunakan mapping yang sama
    const encodedInput = [
      umurNum, // umur sudah angka
      encodingMaps.jenis_kelamin[jenisKelamin],
      encodingMaps.kelompok_populasi[kelompokPopulasi],
      encodingMaps.alasan_kunjungan[alasanKunjungan],
    ];

    // Tahap 3: Normalisasi — gunakan bounds dari training data
    const normalizedInput = normalizeFeatureArray(encodedInput, bounds);

    // === LANGKAH 3: Persiapan data training ===
    // Normalisasi seluruh dataset training
    const normalizedTrainingX = normalizeDataset(encodedData, bounds);
    const trainingY = getLabels(encodedData);

    // === LANGKAH 4: Prediksi menggunakan KNN custom ===
    const result = knnPredict(normalizedTrainingX, trainingY, normalizedInput, 3);

    // === LANGKAH 5: Simpan detail untuk ditampilkan ===
    // (Detail tetangga, voting, dan pipeline)
    const detail = knnPredictWithDetails(normalizedTrainingX, trainingY, normalizedInput, 3);

    setPredictionDetail({
      neighbors: detail.neighbors,
      voting: detail.voting,
      pipeline: { raw: rawInput, cleaned: rawInput, encoded: encodedInput, normalized: normalizedInput },
    });

    setPrediction(result);
  };

  return (
    <div className="w-full space-y-8 sm:space-y-12">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 sm:pb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight uppercase">Sistem Prediksi Risiko Klinis</h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Formulir asesmen mandiri untuk mengevaluasi faktor risiko transmisi berdasarkan analisis pola historis dan algoritma klasifikasi Machine Learning terukur.
        </p>
      </div>

      <div className="w-full bg-white border-2 border-slate-900">
      {/* Header form */}
      <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
        <FileText className="text-white w-5 h-5" />
        <h2 className="text-lg font-medium text-white tracking-widest uppercase">Formulir Evaluasi Risiko</h2>
      </div>

      <div className="p-6 sm:p-8">
        {/* Info pipeline */}
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <strong className="text-slate-900">Pipeline:</strong> Input User → LabelEncoder ({Object.keys(encodingMaps).length} kolom) → Normalisasi (Min-Max) → KNN (K=3) → Prediksi
        </div>

        {/* Form input */}
        <form onSubmit={handlePredict} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {/* Input Usia */}
            <div className="space-y-2">
              <label htmlFor="umur" className="block text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Usia Pasien
              </label>
              <input
                id="umur"
                type="number"
                min="0"
                max="120"
                value={umur}
                onChange={(e) => setUmur(e.target.value)}
                required
                className="w-full px-4 py-3 border-b-2 border-slate-200 focus:border-slate-900 bg-slate-50 focus:bg-white outline-none transition-colors text-slate-900 font-mono"
                placeholder="Misal: 28"
              />
            </div>

            {/* Select Jenis Kelamin */}
            <div className="space-y-2">
              <label htmlFor="jenisKelamin" className="block text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Jenis Kelamin
              </label>
              <select
                id="jenisKelamin"
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value)}
                className="w-full px-4 py-3 border-b-2 border-slate-200 focus:border-slate-900 bg-slate-50 focus:bg-white outline-none transition-colors text-slate-900 cursor-pointer appearance-none"
              >
                {Object.keys(encodingMaps.jenis_kelamin).map(label => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>

            {/* Select Kelompok Populasi */}
            <div className="space-y-2">
              <label htmlFor="kelompokPopulasi" className="block text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Kelompok Populasi
              </label>
              <select
                id="kelompokPopulasi"
                value={kelompokPopulasi}
                onChange={(e) => setKelompokPopulasi(e.target.value)}
                className="w-full px-4 py-3 border-b-2 border-slate-200 focus:border-slate-900 bg-slate-50 focus:bg-white outline-none transition-colors text-slate-900 cursor-pointer appearance-none"
              >
                {Object.keys(encodingMaps.kelompok_populasi).map(label => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>

            {/* Select Alasan Kunjungan */}
            <div className="space-y-2">
              <label htmlFor="alasanKunjungan" className="block text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Alasan Kunjungan
              </label>
              <select
                id="alasanKunjungan"
                value={alasanKunjungan}
                onChange={(e) => setAlasanKunjungan(e.target.value)}
                className="w-full px-4 py-3 border-b-2 border-slate-200 focus:border-slate-900 bg-slate-50 focus:bg-white outline-none transition-colors text-slate-900 cursor-pointer appearance-none"
              >
                {Object.keys(encodingMaps.alasan_kunjungan).map(label => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tombol submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-6 transition-colors uppercase tracking-widest text-sm outline-offset-2"
            >
              Proses Analisis Risiko
            </button>
          </div>
        </form>

        {/* Hasil prediksi */}
        {prediction !== null && predictionDetail && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-2 duration-500 border-t-2 border-slate-100 pt-8">
            {/* Pipeline Input */}
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Pipeline Input:</h4>
              <div className="space-y-1 text-xs font-mono">
                <div><span className="text-slate-500 w-20 inline-block">Raw:</span> [{predictionDetail.pipeline.raw.join(', ')}]</div>
                <div><span className="text-slate-500 w-20 inline-block">Encoded:</span> [{predictionDetail.pipeline.encoded.join(', ')}]</div>
                <div><span className="text-slate-500 w-20 inline-block">Normalized:</span> [{predictionDetail.pipeline.normalized.map(v => v.toFixed(4)).join(', ')}]</div>
              </div>
            </div>

            {/* Prediksi 0: Belum Tahu */}
            {prediction === 0 && (
              <div className="p-6 bg-slate-50 border-l-4 border-slate-400 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-slate-500 shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide mb-2">
                    Hasil: Belum Tahu (Indeterminate)
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Profil yang kamu masukkan belum bisa dipastikan masuk kategori mana. Bisa jadi datanya kurang representatif atau memang perlu pemeriksaan lebih lanjut. Disarankan untuk tes ulang atau konsultasi ke dokter.
                  </p>
                </div>
              </div>
            )}

            {/* Prediksi 1: Bukan ODHIV */}
            {prediction === 1 && (
              <div className="p-6 bg-slate-50 border-l-4 border-slate-900 flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-slate-900 shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide mb-2">
                    Hasil: Bukan ODHIV (Negatif)
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Berdasarkan data latih, profil ini lebih mirip dengan pasien yang tidak teridentifikasi HIV. Tapi ingat, ini cuma prediksi dari data — bukan diagnosis final. Kalau ragu, tetap lakukan tes HIV yang resmi.
                  </p>
                </div>
              </div>
            )}

            {/* Prediksi 2: ODHIV */}
            {prediction === 2 && (
              <div className="p-6 bg-slate-50 border-l-4 border-slate-900 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-slate-900 shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide mb-2">
                    Hasil: ODHIV (Positif)
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Profil ini mirip dengan pasien yang teridentifikasi HIV di data latih kami. Ini bukan berarti kamu pasti positif — tapi sebaiknya segera lakukan tes HIV di fasyankes terdekat untuk memastikan.
                  </p>
                </div>
              </div>
            )}

            {/* Detail KNN */}
            <div className="mt-6 p-4 bg-white border border-slate-200">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Detail KNN (K=3):</h4>
              <div className="space-y-1 text-xs font-mono">
                <div><span className="text-slate-500">Voting:</span> {Object.entries(predictionDetail.voting).map(([k, v]) => `Kelas ${k}: ${v} suara`).join(', ')}</div>
                <div><span className="text-slate-500">3 Tetangga Terdekat:</span></div>
                {predictionDetail.neighbors.map((n, i) => (
                  <div key={i} className="ml-4">
                    → Kelas {n.label}, jarak = {n.distance.toFixed(4)}
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer medis */}
            <div className="mt-8 border border-slate-200 p-5 text-sm text-slate-500 leading-relaxed bg-white">
              <strong className="font-semibold text-slate-900 uppercase tracking-wider text-xs block mb-1">Penting Dibaca</strong>
              Hasil prediksi di atas bukan diagnosis medis. Sistem ini cuma tools edukasi yang menunjukkan bagaimana KNN bekerja dalam konteks kesehatan. Untuk diagnosis yang akurat, silakan lakukan tes HIV di fasyankes (ELISA / Western Blot) dan konsultasi dengan dokter yang kompeten.
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
