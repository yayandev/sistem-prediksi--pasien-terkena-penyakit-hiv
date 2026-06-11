import React, { useState } from 'react';
import KNN from 'ml-knn';
import { getBounds, normalizeFeatureArray, normalizeDataset, getLabels } from '../utils/normalization';
import hivDataset from '../data/hiv_dataset.json';
import { AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function Predictor() {
  const [umur, setUmur] = useState<string>('');
  const [jenisKelamin, setJenisKelamin] = useState<string>('1');
  const [kelompokPopulasi, setKelompokPopulasi] = useState<string>('0');
  const [alasanKunjungan, setAlasanKunjungan] = useState<string>('0');
  const [prediction, setPrediction] = useState<number | null>(null);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();

    const umurNum = parseInt(umur, 10);
    const jenisKelaminNum = parseInt(jenisKelamin, 10);
    const kelompokPopulasiNum = parseInt(kelompokPopulasi, 10);
    const alasanKunjunganNum = parseInt(alasanKunjungan, 10);

    if (isNaN(umurNum)) {
      alert('Harap masukkan nilai numerik yang valid untuk Usia.');
      return;
    }

    const userInput = [umurNum, jenisKelaminNum, kelompokPopulasiNum, alasanKunjunganNum];

    // Prepare data
    const bounds = getBounds(hivDataset);
    const normalizedTrainingX = normalizeDataset(hivDataset, bounds);
    const trainingY = getLabels(hivDataset);

    // Normalize user input
    const normalizedUserInput = normalizeFeatureArray(userInput, bounds);

    // Predict using KNN
    const knn = new KNN(normalizedTrainingX, trainingY, { k: 3 });
    const result = knn.predict(normalizedUserInput);

    setPrediction(result);
  };

  return (
    <div className="w-full bg-white border-2 border-slate-900">
      <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
        <FileText className="text-white w-5 h-5" />
        <h2 className="text-lg font-medium text-white tracking-widest uppercase">Formulir Evaluasi Risiko</h2>
      </div>

      <div className="p-6 sm:p-8">
        <form onSubmit={handlePredict} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
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

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-6 transition-colors uppercase tracking-widest text-sm outline-offset-2"
            >
              Proses Analisis Risiko
            </button>
          </div>
        </form>

        {prediction !== null && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-2 duration-500 border-t-2 border-slate-100 pt-8">
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
