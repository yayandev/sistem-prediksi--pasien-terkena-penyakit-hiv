/**
 * Predictor.tsx
 * =============
 * Komponen formulir prediksi risiko HIV menggunakan algoritma KNN custom.
 *
 * Alur Kerja:
 *   1. User mengisi form (usia, jenis kelamin, kelompok populasi, alasan kunjungan)
 *   2. Sistem menormalisasi input user menggunakan Min-Max Normalization
 *   3. Sistem menjalankan KNN custom (tanpa library external)
 *   4. Sistem menampilkan hasil prediksi (0: Belum Tahu, 1: Bukan ODHIV, 2: ODHIV)
 *
 * Catatan: Tidak ada library ML external yang digunakan.
 *          Semua algoritma (Euclidean Distance, KNN, Normalisasi) diimplementasi dari scratch.
 */

import React, { useState } from 'react';
// Import fungsi normalisasi dari scratch
import { getBounds, normalizeFeatureArray, normalizeDataset, getLabels } from '../utils/normalization';
// Import KNN custom dari scratch (BUKAN ml-knn)
import { knnPredict } from '../utils/knn';
// Import dataset HIV
import hivDataset from '../data/hiv_dataset.json';
// Import icon Lucide
import { AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

/**
 * Komponen Predictor — form asesmen risiko HIV + hasil prediksi KNN.
 */
export default function Predictor() {
  // State untuk menyimpan nilai form
  const [umur, setUmur] = useState<string>('');
  const [jenisKelamin, setJenisKelamin] = useState<string>('1');
  const [kelompokPopulasi, setKelompokPopulasi] = useState<string>('0');
  const [alasanKunjungan, setAlasanKunjungan] = useState<string>('0');
  // State untuk menyimpan hasil prediksi (null = belum diprediksi)
  const [prediction, setPrediction] = useState<number | null>(null);

  /**
   * Handler saat form disubmit — menjalankan pipeline KNN dari scratch.
   *
   * Alur:
   *   1. Parse input user ke integer
   *   2. Hitung bounds (min/max) dari dataset training
   *   3. Normalisasi dataset training dan input user
   *   4. Jalankan KNN custom dengan K=3
   *   5. Tampilkan hasil prediksi
   */
  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();

    // === LANGKAH 1: Parse input user ===
    const umurNum = parseInt(umur, 10);
    const jenisKelaminNum = parseInt(jenisKelamin, 10);
    const kelompokPopulasiNum = parseInt(kelompokPopulasi, 10);
    const alasanKunjunganNum = parseInt(alasanKunjungan, 10);

    // Validasi: pastikan usia adalah angka yang valid
    if (isNaN(umurNum)) {
      alert('Harap masukkan nilai numerik yang valid untuk Usia.');
      return;
    }

    // Gabungkan semua input menjadi vektor fitur
    const userInput = [umurNum, jenisKelaminNum, kelompokPopulasiNum, alasanKunjunganNum];

    // === LANGKAH 2: Persiapan data training ===
    // Hitung batas min/max dari dataset (digunakan untuk normalisasi)
    const bounds = getBounds(hivDataset);

    // Normalisasi seluruh dataset training (23 baris)
    // Rumus: x_normalized = (x - min) / (max - min)
    const normalizedTrainingX = normalizeDataset(hivDataset, bounds);

    // Ekstrak label kelas (status: 0, 1, atau 2)
    const trainingY = getLabels(hivDataset);

    // === LANGKAH 3: Normalisasi input user ===
    // Gunakan bounds yang SAMA dengan training data
    const normalizedUserInput = normalizeFeatureArray(userInput, bounds);

    // === LANGKAH 4: Prediksi menggunakan KNN custom ===
    // K = 3 tetangga terdekat
    // Tidak menggunakan library ml-knn — semuanya dihitung dari scratch
    const result = knnPredict(normalizedTrainingX, trainingY, normalizedUserInput, 3);

    // === LANGKAH 5: Tampilkan hasil ===
    setPrediction(result);
  };

  return (
    <div className="w-full bg-white border-2 border-slate-900">
      {/* Header form */}
      <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
        <FileText className="text-white w-5 h-5" />
        <h2 className="text-lg font-medium text-white tracking-widest uppercase">Formulir Evaluasi Risiko</h2>
      </div>

      <div className="p-6 sm:p-8">
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
                <option value="1">Laki-laki</option>
                <option value="0">Perempuan</option>
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
                <option value="0">Populasi Umum</option>
                <option value="1">Pasien TB</option>
                <option value="2">LSL (Lelaki Seks Lelaki)</option>
                <option value="3">Pekerja Seks</option>
                <option value="4">Waria</option>
                <option value="5">Pengguna Napza Suntik</option>
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
                <option value="0">Tes HIV</option>
                <option value="1">Kunjungan Rutin PDP</option>
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
        {prediction !== null && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-2 duration-500 border-t-2 border-slate-100 pt-8">
            {/* Prediksi 0: Belum Tahu */}
            {prediction === 0 && (
              <div className="p-6 bg-slate-50 border-l-4 border-slate-400 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-slate-500 shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide mb-2">
                    Hasil Indikasi: Belum Tahu (Indeterminate)
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Berdasarkan metrik yang dimasukkan, profil ini belum dapat diklasifikasikan dengan tegas. Pemeriksaan lebih lanjut disarankan.
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
                    Hasil Indikasi: Bukan ODHIV (Negatif)
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Berdasarkan metrik yang dimasukkan, profil ini paling mendekati pola risiko rendah pada basis data referensi klinis kami saat ini.
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
                    Hasil Indikasi: ODHIV (Positif)
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Karakteristik demografi dan riwayat kunjungan medis yang dimasukkan sejajar dengan profil riwayat pasien berisiko tinggi.
                  </p>
                </div>
              </div>
            )}

            {/* Disclaimer medis */}
            <div className="mt-8 border border-slate-200 p-5 p-4 text-sm text-slate-500 leading-relaxed bg-white">
              <strong className="font-semibold text-slate-900 uppercase tracking-wider text-xs block mb-1">Pernyataan Batasan Tanggung Jawab Medis</strong>
              Aplikasi ini dirancang secara eksklusif untuk tujuan pameran komputasional (model KNN) dan tidak memadai untuk diinterpretasikan sebagai diagnosis definitif. Sistem ini bukan pengganti untuk evaluasi, konseling, maupun pengujian klinis formal seperti uji titer ELISA atau Western Blot yang diatur oleh tenaga ahli medis bersertifikasi.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
