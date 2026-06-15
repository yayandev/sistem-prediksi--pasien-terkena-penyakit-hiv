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
import { runFullPreprocessing } from '../utils/preprocessing';
import { getBounds, normalizeFeatureArray, normalizeDataset, getLabels } from '../utils/normalization';
import { knnPredict, knnPredictWithDetails } from '../utils/knn';
import rawDataset from '../data/raw_hiv_dataset.json';
import { AlertCircle, FileText, CheckCircle2, Info, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

/** Nama kelas target */
const CLASS_NAMES: Record<number, string> = {
  0: 'Belum Tahu (Indeterminate)',
  1: 'Bukan ODHIV (Negatif)',
  2: 'ODHIV (Positif)',
};

export default function Predictor() {
  const [umur, setUmur] = useState<string>('');
  const [jenisKelamin, setJenisKelamin] = useState<string>('Laki-laki');
  const [kelompokPopulasi, setKelompokPopulasi] = useState<string>('Populasi Umum');
  const [alasanKunjungan, setAlasanKunjungan] = useState<string>('Tes HIV');
  const [prediction, setPrediction] = useState<number | null>(null);
  const [predictionDetail, setPredictionDetail] = useState<{
    neighbors: { label: number; distance: number }[];
    voting: Record<number, number>;
    pipeline: { raw: string[]; encoded: number[]; normalized: number[] };
  } | null>(null);
  const [showPipelineDetail, setShowPipelineDetail] = useState(false);

  const { cleanedData, encodedData, encodingMaps } = useMemo(() => {
    return runFullPreprocessing(rawDataset);
  }, []);

  const bounds = useMemo(() => {
    return getBounds(encodedData);
  }, [encodedData]);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();

    const umurNum = parseInt(umur, 10);
    if (isNaN(umurNum)) {
      alert('Harap masukkan nilai numerik yang valid untuk Usia.');
      return;
    }

    // Pipeline: Raw → LabelEncoder → Normalisasi → KNN
    const rawInput = [String(umurNum), jenisKelamin, kelompokPopulasi, alasanKunjungan];
    const encodedInput = [
      umurNum,
      encodingMaps.jenis_kelamin[jenisKelamin],
      encodingMaps.kelompok_populasi[kelompokPopulasi],
      encodingMaps.alasan_kunjungan[alasanKunjungan],
    ];
    const normalizedInput = normalizeFeatureArray(encodedInput, bounds);

    const normalizedTrainingX = normalizeDataset(encodedData, bounds);
    const trainingY = getLabels(encodedData);

    const result = knnPredict(normalizedTrainingX, trainingY, normalizedInput, 3);
    const detail = knnPredictWithDetails(normalizedTrainingX, trainingY, normalizedInput, 3);

    setPredictionDetail({
      neighbors: detail.neighbors,
      voting: detail.voting,
      pipeline: { raw: rawInput, encoded: encodedInput, normalized: normalizedInput },
    });

    setPrediction(result);
  };

  // Hitung total suara
  const totalVotes: number = predictionDetail
    ? (Object.values(predictionDetail.voting) as number[]).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="w-full space-y-8 sm:space-y-10">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 sm:pb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight uppercase">Sistem Prediksi Pasien Terkena Penyakit HIV</h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Formulir asesmen mandiri untuk mengevaluasi faktor risiko transmisi berdasarkan analisis pola historis dan algoritma klasifikasi Machine Learning terukur.
        </p>
      </div>

      {/* ============================================ */}
      {/* PENJELASAN CARA KERJA SISTEM */}
      {/* ============================================ */}
      <div className="bg-white border-2 border-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <Info className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase">Cara Kerja Sistem Ini</h2>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            Sistem ini menggunakan algoritma <strong className="font-semibold text-slate-900">K-Nearest Neighbors (KNN)</strong> — salah satu algoritma Machine Learning paling sederhana dan intuitif. Prinsipnya: <em>"Lihat pasien yang paling mirip dengan profil kamu, lalu ambil mayoritas prediksi mereka."</em>
          </p>

          {/* Step-by-step */}
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Isi Formulir',
                desc: 'Masukkan data kamu: usia, jenis kelamin, kelompok populasi, dan alasan kunjungan ke poli VCT.',
              },
              {
                step: '2',
                title: 'Sistem Mengubah ke Angka',
                desc: 'Input berupa teks (misal "Laki-laki") diubah jadi angka pakai LabelEncoder. Laki-laki=0, Perempuan=1, dst. Ini diperlukan karena KNN menghitung jarak pakai angka.',
              },
              {
                step: '3',
                title: 'Normalisasi',
                desc: 'Semua angka dikompres ke range 0-1 supaya adil. Usia (21-62) dan Jenis Kelamin (0-1) harus punya bobot yang sama saat dihitung jaraknya.',
              },
              {
                step: '4',
                title: 'KNN Mencari 3 Tetangga Terdekat',
                desc: 'Sistem menghitung jarak profil kamu ke SEMUA pasien di data latih (21 data). Lalu ambil 3 yang paling mirip (jarak terkecil).',
              },
              {
                step: '5',
                title: 'Voting Mayoritas',
                desc: 'Dari 3 tetangga tadi, lihat label mana yang paling banyak muncul. Itulah hasil prediksi. Misal: 2 tetangga bilang "ODHIV", 1 bilang "Bukan ODHIV" → hasilnya ODHIV.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-sm font-bold font-mono">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <strong>Catatan:</strong> Data latih berasal dari 21 rekam medis pasien VCT di RSUD Dr. Chasbullah Abdul Madjid Kota Bekasi (representatif dari 2.205 data asli). KNN belajar dari pola data ini untuk memprediksi data baru.
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FORMULIR INPUT */}
      {/* ============================================ */}
      <div className="bg-white border-2 border-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <FileText className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase">Formulir Evaluasi Risiko</h2>
        </div>

        <div className="p-6 sm:p-8">
          {/* Pipeline info */}
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900">Pipeline:</strong> Input User → LabelEncoder ({Object.keys(encodingMaps).length} kolom) → Normalisasi (Min-Max) → KNN (K=3) → Prediksi
          </div>

          <form onSubmit={handlePredict} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {/* Input Usia */}
              <div className="space-y-2">
                <label htmlFor="umur" className="block text-sm font-semibold text-slate-900 uppercase tracking-wide">
                  Usia Pasien
                </label>
                <p className="text-[11px] text-slate-500 -mt-1">Usia dalam tahun. Rentang data latih: 21-62 tahun.</p>
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
                <p className="text-[11px] text-slate-500 -mt-1">Dienkoding: Laki-laki=0, Perempuan=1.</p>
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
                <p className="text-[11px] text-slate-500 -mt-1">Golongan berisiko: LSL, Pengguna Napza, Waria, dll.</p>
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
                <p className="text-[11px] text-slate-500 -mt1">Korelasi tertinggi (-0.86) dengan status ODHIV.</p>
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

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-6 transition-colors uppercase tracking-widest text-sm outline-offset-2"
              >
                Proses Analisis Risiko
              </button>
            </div>
          </form>

          {/* ============================================ */}
          {/* HASIL PREDIKSI */}
          {/* ============================================ */}
          {prediction !== null && predictionDetail && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-2 duration-500 border-t-2 border-slate-100 pt-8 space-y-6">

              {/* Header Hasil */}
              <div className="text-center">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Hasil Analisis</h3>
                <div className={`inline-block px-6 py-3 text-lg font-bold uppercase tracking-wide ${
                  prediction === 2 ? 'bg-slate-900 text-white' : prediction === 1 ? 'bg-slate-100 text-slate-900 border border-slate-300' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {CLASS_NAMES[prediction]}
                </div>
              </div>

              {/* Penjelasan Hasil */}
              {prediction === 0 && (
                <div className="p-5 bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Apa artinya?</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dari 3 tetangga terdekat yang ditemukan, hasilnya campuran — tidak ada kelas yang menang mutlak. Artinya profil kamu berada di area "abu-abu" di antara kategori ODHIV dan Bukan ODHIV.
                  </p>
                  <h4 className="text-sm font-bold text-slate-900">Yang harus dilakukan:</h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li>Lakukan tes HIV ulang di fasyankes dalam 3-6 bulan ke depan</li>
                    <li>Konsultasi dengan konselor HIV untuk penanganan lebih lanjut</li>
                    <li>Jangan panik — "Belum Tahu" bukan berarti positif, tapi juga bukan berarti negatif</li>
                  </ul>
                </div>
              )}

              {prediction === 1 && (
                <div className="p-5 bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Apa artinya?</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mayoritas tetangga terdekat kamu (2 dari 3) adalah pasien yang <strong>tidak teridentifikasi HIV</strong>. Profil demografi dan alasan kunjungan kamu lebih mirip dengan pasien golongan rendah risiko.
                  </p>
                  <h4 className="text-sm font-bold text-slate-900">Yang harus dilakukan:</h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li>Tetap disarankan untuk melakukan tes HIV rutin (minimal setahun sekali)</li>
                    <li>Pertahankan pola hidup sehat dan hindari perilaku berisiko</li>
                    <li>Hasil ini bukan jaminan — tetap waspada dan lakukan pencegahan</li>
                  </ul>
                </div>
              )}

              {prediction === 2 && (
                <div className="p-5 bg-red-50 border border-red-200 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Apa artinya?</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mayoritas tetangga terdekat kamu (2 dari 3) adalah pasien yang <strong>teridentifikasi HIV (ODHIV)</strong>. Profil kamu — kombinasi usia, jenis kelamin, kelompok populasi, dan alasan kunjungan — sangat mirip dengan pola pasien berisiko tinggi di data latih.
                  </p>
                  <h4 className="text-sm font-bold text-slate-900">Yang harus dilakukan:</h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li><strong>Segera</strong> lakukan tes HIV di fasyankes terdekat (ELISA / Western Blot)</li>
                    <li>Jangan tunda — semakin cepat terdeteksi, semakin baik penanganannya</li>
                    <li>Konsultasi dengan dokter spesialis untuk langkah selanjutnya</li>
                    <li>Ingat: ini prediksi, bukan diagnosis final. Tapi sebaiknya diambil langkah antisipasi</li>
                  </ul>
                </div>
              )}

              {/* ============================================ */}
              {/* PIPELINE: INPUT → ENCODED → NORMALIZED */}
              {/* ============================================ */}
              <div className="bg-white border border-slate-200">
                <button
                  onClick={() => setShowPipelineDetail(!showPipelineDetail)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Pipeline Transformasi Input</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Lihat bagaimana input kamu diubah dari teks → angka → normalisasi</p>
                  </div>
                  {showPipelineDetail ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showPipelineDetail && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
                    {/* Tabel transformasi per fitur */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="p-2 text-left border border-slate-300 font-semibold">Fitur</th>
                            <th className="p-2 text-left border border-slate-300 font-semibold">Input (Teks)</th>
                            <th className="p-2 text-center border border-slate-300 font-semibold">Setelah Encode</th>
                            <th className="p-2 text-center border border-slate-300 font-semibold">Setelah Normalisasi</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border border-slate-300 font-semibold">Usia</td>
                            <td className="p-2 border border-slate-300 font-mono">{predictionDetail.pipeline.raw[0]}</td>
                            <td className="p-2 text-center border border-slate-300 font-mono">{predictionDetail.pipeline.encoded[0]}</td>
                            <td className="p-2 text-center border border-slate-300 font-mono">{predictionDetail.pipeline.normalized[0].toFixed(4)}</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-slate-300 font-semibold">Jenis Kelamin</td>
                            <td className="p-2 border border-slate-300 font-mono">{predictionDetail.pipeline.raw[1]}</td>
                            <td className="p-2 text-center border border-slate-300 font-mono">{predictionDetail.pipeline.encoded[1]}</td>
                            <td className="p-2 text-center border border-slate-300 font-mono">{predictionDetail.pipeline.normalized[1].toFixed(4)}</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-slate-300 font-semibold">Kel. Populasi</td>
                            <td className="p-2 border border-slate-300 font-mono">{predictionDetail.pipeline.raw[2]}</td>
                            <td className="p-2 text-center border border-slate-300 font-mono">{predictionDetail.pipeline.encoded[2]}</td>
                            <td className="p-2 text-center border border-slate-300 font-mono">{predictionDetail.pipeline.normalized[2].toFixed(4)}</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-slate-300 font-semibold">Alasan Kunj.</td>
                            <td className="p-2 border border-slate-300 font-mono">{predictionDetail.pipeline.raw[3]}</td>
                            <td className="p-2 text-center border border-slate-300 font-mono">{predictionDetail.pipeline.encoded[3]}</td>
                            <td className="p-2 text-center border border-slate-300 font-mono">{predictionDetail.pipeline.normalized[3].toFixed(4)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1">
                      <p><strong>Raw → Encoded:</strong> Teks diubah ke angka berdasarkan urutan alfabet (LabelEncoder).</p>
                      <p><strong>Encoded → Normalized:</strong> Angka dikompres ke range 0-1 pakai rumus (x - min) / (max - min).</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================ */}
              {/* DETAIL KNN: TETANGGA & VOTING */}
              {/* ============================================ */}
              <div className="bg-white border border-slate-200 p-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Detail Proses KNN (K=3)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">3 pasien paling mirip dengan profil kamu di data latih, dan siapa yang menang voting</p>
                </div>

                {/* Tabel Tetangga */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-2 text-center border border-slate-300 font-semibold">Peringkat</th>
                        <th className="p-2 text-center border border-slate-300 font-semibold">Kelas Tetangga</th>
                        <th className="p-2 text-center border border-slate-300 font-semibold">Jarak Euclidean</th>
                        <th className="p-2 text-left border border-slate-300 font-semibold">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictionDetail.neighbors.map((n, i) => (
                        <tr key={i} className={i === 0 ? 'bg-slate-50' : ''}>
                          <td className="p-2 text-center border border-slate-300 font-mono font-bold">#{i + 1}</td>
                          <td className="p-2 text-center border border-slate-300">
                            <span className={`inline-block px-2 py-0.5 font-semibold ${
                              n.label === 2 ? 'bg-slate-900 text-white' : n.label === 1 ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {CLASS_NAMES[n.label]}
                            </span>
                          </td>
                          <td className="p-2 text-center border border-slate-300 font-mono">{n.distance.toFixed(4)}</td>
                          <td className="p-2 text-left border border-slate-300 text-slate-600">
                            {i === 0 ? 'Paling mirip' : i === 1 ? 'Kedua paling mirip' : 'Ketiga paling mirip'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Voting */}
                <div className="p-4 bg-slate-50 border border-slate-200">
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">Hasil Voting Mayoritas</h5>
                  <div className="space-y-2">
                    {(Object.entries(predictionDetail.voting) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([label, count]) => {
                      const labelNum = parseInt(label, 10);
                      const percentage = (count / totalVotes) * 100;
                      const isWinner = count === Math.max(...(Object.values(predictionDetail.voting) as number[]));
                      return (
                        <div key={label} className="flex items-center gap-3">
                          <span className="text-[11px] font-mono w-28 text-right text-slate-600 truncate">{CLASS_NAMES[labelNum]}</span>
                          <div className="flex-1 bg-slate-200 h-5 relative rounded-sm overflow-hidden">
                            <div
                              className={`h-full transition-all ${isWinner ? 'bg-slate-900' : 'bg-slate-400'}`}
                              style={{ width: `${percentage}%` }}
                            />
                            <span className={`absolute right-2 top-0 h-5 flex items-center text-[10px] font-mono ${isWinner ? 'text-white font-bold' : 'text-slate-600'}`}>
                              {count} suara ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          {isWinner && (
                            <span className="text-[10px] font-bold text-slate-900 uppercase bg-yellow-100 px-2 py-0.5 border border-yellow-300 shrink-0">
                              MENANG
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                    Karena {Math.max(...(Object.values(predictionDetail.voting) as number[]))} dari {totalVotes} tetangga memilih kelas <strong>{CLASS_NAMES[prediction]}</strong>, maka hasil prediksinya adalah <strong>{CLASS_NAMES[prediction]}</strong>.
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong className="block mb-1">Catatan Penting:</strong>
                Hasil prediksi di atas bukan diagnosis medis. Sistem ini dibuat untuk edukasi — menunjukkan bagaimana KNN bekerja dalam konteks kesehatan. Akurasi model ini adalah {((predictionDetail.voting[prediction as unknown as number] as number || 0) / totalVotes * 100).toFixed(0)}% berdasarkan voting tetangga. Untuk diagnosis yang akurat, silakan lakukan tes HIV di fasyankes (ELISA / Western Blot) dan konsultasi dengan dokter yang kompeten.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
