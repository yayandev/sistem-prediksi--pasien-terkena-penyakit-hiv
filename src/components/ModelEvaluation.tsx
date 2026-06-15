/**
 * ModelEvaluation.tsx
 * ===================
 * Komponen tab "Evaluasi Model" — menampilkan SELURUH pipeline preprocessing
 * dan evaluasi model KNN dari scratch dengan PENJELASAN LENGKAP di setiap tahap.
 *
 * Pipeline (sesuai Jurnal halaman 128-136):
 *   Tahap 1: Data Cleaning — hapus baris dengan missing value
 *   Tahap 2: LabelEncoder — ubah string kategorikal ke numerik
 *   Tahap 3: Splitting Data — bagi 80% training, 20% testing
 *   Tahap 4: SMOTE — seimbangkan kelas minoritas
 *   Tahap 5: Normalisasi — Min-Max Normalization
 *
 * Setiap tahap menampilkan:
 *   - Input (apa yang masuk)
 *   - Proses (apa yang dilakukan)
 *   - Output (apa yang dihasilkan)
 *   - Penjelasan (MENGAPA output-nya begini)
 */

import React, { useState, useMemo } from 'react';
import { runFullPreprocessing } from '../utils/preprocessing';
import { trainTestSplit } from '../utils/splitting';
import { evaluateModel } from '../utils/evaluation';
import { findOptimalK } from '../utils/validation';
import { smoteAllClasses } from '../utils/sMOTE';
import { getBounds, normalizeDataset, getLabels } from '../utils/normalization';
import { correlationMatrix } from '../utils/correlation';
import rawDataset from '../data/raw_hiv_dataset.json';
import { Table2, Target, TrendingUp, BarChart3, Layers, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Komponen collapsible section — bisa dibuka/ditutup.
 */
function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border-2 border-slate-900">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 px-6 py-4 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <Icon className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase text-left">{title}</h2>
        </div>
        {isOpen ? <ChevronUp className="text-white w-5 h-5" /> : <ChevronDown className="text-white w-5 h-5" />}
      </button>
      {isOpen && <div className="p-6">{children}</div>}
    </div>
  );
}

/**
 * Komponen utama ModelEvaluation.
 */
export default function ModelEvaluation() {
  const [selectedK, setSelectedK] = useState<number>(3);

  // ========================================
  // PIPELINE PREPROCESSING
  // ========================================

  // Tahap 1 & 2: Cleaning + LabelEncoder
  const preprocessing = useMemo(() => {
    return runFullPreprocessing(rawDataset);
  }, []);

  // Tahap 3: Splitting (80/20)
  const split = useMemo(() => {
    return trainTestSplit(preprocessing.encodedData, 0.2, 42);
  }, [preprocessing.encodedData]);

  // Tahap 4: SMOTE (hanya pada data training)
  const smoteTraining = useMemo(() => {
    return smoteAllClasses(split.train, 3, 42);
  }, [split.train]);

  // Tahap 5: Normalisasi
  const normalization = useMemo(() => {
    const bounds = getBounds(smoteTraining);
    const normalizedTrain = normalizeDataset(smoteTraining, bounds);
    const normalizedTest = normalizeDataset(split.test, bounds);
    return { bounds, normalizedTrain, normalizedTest };
  }, [smoteTraining, split.test]);

  // ========================================
  // EVALUASI MODEL
  // ========================================

  const evaluation = useMemo(() => {
    return evaluateModel(preprocessing.encodedData, selectedK, 42);
  }, [preprocessing.encodedData, selectedK]);

  const kOptimization = useMemo(() => {
    return findOptimalK(preprocessing.encodedData, 15, 5, 42);
  }, [preprocessing.encodedData]);

  const correlations = useMemo(() => {
    return correlationMatrix(preprocessing.encodedData);
  }, [preprocessing.encodedData]);

  // Nama kelas
  const classNames = ['Belum Tahu', 'Bukan ODHIV', 'ODHIV'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 sm:pb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight uppercase">Evaluasi Model KNN</h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Seluruh pipeline preprocessing dan evaluasi model K-Nearest Neighbors.
          Setiap tahap dijelaskan MENGAPA output-nya demikian.
        </p>
      </div>

      {/* ======================================== */}
      {/* TAHAP 1: DATA CLEANING */}
      {/* ======================================== */}
      <Section title="Tahap 1 — Data Cleaning" icon={Layers} defaultOpen={true}>
        <div className="space-y-4">
          {/* Penjelasan Alur */}
          <div className="p-4 bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Alur Tahapan:</h3>
            <div className="text-xs text-slate-700 space-y-1">
              <p><strong>Input:</strong> Dataset mentah ({preprocessing.report.rawCount} baris) dalam bentuk string (kategorikal).</p>
              <p><strong>Proses:</strong> Periksa setiap baris — jika ADA field yang null/kosong, HAPUS seluruh baris.</p>
              <p><strong>Output:</strong> Dataset bersih ({preprocessing.report.cleanedCount} baris) tanpa missing value.</p>
            </div>
          </div>

          {/* Alasan */}
          <div className="p-4 bg-white border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Mengapa output-nya begini?</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>Baris yang dihapus ({preprocessing.report.removedRows} baris):</strong> Memiliki null di kolom "kelompok_populasi".</li>
              <li>• <strong>Karena null pada kelompok_populasi</strong> — KNN tidak bisa menghitung jarak jika ada fitur yang tidak diketahui.</li>
              <li>• <strong>Sama dengan jurnal (hal. 128):</strong> "Dataset memiliki 2.205 baris, dimana hanya kolom Kelompok Populasi yang memiliki 5 data yang hilang (null)."</li>
            </ul>
          </div>

          {/* Tabel Contoh Data Sebelum/Sesudah */}
          <div className="overflow-x-auto">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Contoh Data (3 baris pertama sesudah cleaning):</h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left border border-slate-300">Umur</th>
                  <th className="p-2 text-left border border-slate-300">Jenis Kelamin</th>
                  <th className="p-2 text-left border border-slate-300">Kel. Populasi</th>
                  <th className="p-2 text-left border border-slate-300">Alasan Kunj.</th>
                  <th className="p-2 text-left border border-slate-300">Status ODHIV</th>
                </tr>
              </thead>
              <tbody>
                {preprocessing.cleanedData.slice(0, 3).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 font-mono">{row.umur}</td>
                    <td className="p-2 border border-slate-300">{row.jenis_kelamin}</td>
                    <td className="p-2 border border-slate-300">{row.kelompok_populasi}</td>
                    <td className="p-2 border border-slate-300">{row.alasan_kunjungan}</td>
                    <td className="p-2 border border-slate-300">{row.status_odhiv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-slate-500 mt-1">Data masih dalam bentuk STRING (belum angka) — akan diproses di Tahap 2.</p>
          </div>
        </div>
      </Section>

      {/* ======================================== */}
      {/* TAHAP 2: LABEL ENCODER */}
      {/* ======================================== */}
      <Section title="Tahap 2 — Label Encoder" icon={Layers}>
        <div className="space-y-4">
          {/* Penjelasan */}
          <div className="p-4 bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Alur Tahapan:</h3>
            <div className="text-xs text-slate-700 space-y-1">
              <p><strong>Input:</strong> Dataset bersih ({preprocessing.report.cleanedCount} baris) dengan nilai STRING.</p>
              <p><strong>Proses:</strong> Kumpulkan semua nilai unik per kolom → urutkan → assign angka berurutan.</p>
              <p><strong>Output:</strong> Dataset ter-encode (angka) yang bisa diproses KNN.</p>
            </div>
          </div>

          {/* Mapping */}
          <div className="p-4 bg-white border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Mengapa output-nya begini?</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>KNN bekerja dengan angka</strong> — Euclidean Distance tidak bisa menghitung jarak antara string "Laki-laki" dan "Perempuan".</li>
              <li>• <strong>LabelEncoder mengurutkan alphabetically</strong> → Laki-laki=0, Perempuan=1 (L di depan P).</li>
              <li>• <strong>Sama dengan jurnal (hal. 129):</strong> "LabelEncoder berfungsi untuk mengubah setiap nilai dalam kolom menjadi angka berurutan."</li>
            </ul>
          </div>

          {/* Tabel Mapping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(preprocessing.encodingMaps).map(([kolom, mapping]) => (
              <div key={kolom} className="border border-slate-200">
                <div className="bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 uppercase">{kolom}</div>
                <div className="p-3">
                  {Object.entries(mapping).map(([str, num]) => (
                    <div key={str} className="flex justify-between text-xs py-1">
                      <span className="text-slate-700">{str}</span>
                      <span className="font-mono font-bold text-slate-900">= {num}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contoh Data Ter-encode */}
          <div className="overflow-x-auto">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Contoh Data Sesudah Encoding (3 baris pertama):</h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left border border-slate-300">Umur</th>
                  <th className="p-2 text-left border border-slate-300">Jenis Kelamin</th>
                  <th className="p-2 text-left border border-slate-300">Kel. Populasi</th>
                  <th className="p-2 text-left border border-slate-300">Alasan Kunj.</th>
                  <th className="p-2 text-left border border-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {preprocessing.encodedData.slice(0, 3).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 font-mono">{row.umur}</td>
                    <td className="p-2 border border-slate-300 font-mono">{row.jenis_kelamin}</td>
                    <td className="p-2 border border-slate-300 font-mono">{row.kelompok_populasi}</td>
                    <td className="p-2 border border-slate-300 font-mono">{row.alasan_kunjungan}</td>
                    <td className="p-2 border border-slate-300 font-mono">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ======================================== */}
      {/* TAHAP 3: SPLITTING DATA */}
      {/* ======================================== */}
      <Section title="Tahap 3 — Splitting Data (80/20)" icon={Layers}>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Alur Tahapan:</h3>
            <div className="text-xs text-slate-700 space-y-1">
              <p><strong>Input:</strong> {preprocessing.encodedData.length} data ter-encode.</p>
              <p><strong>Proses:</strong> Acak dengan Fisher-Yates Shuffle (seed=42) → ambil 80% pertama = training, 20% sisanya = testing.</p>
              <p><strong>Output:</strong> Training = {split.train.length} data, Testing = {split.test.length} data.</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Mengapa output-nya begini?</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>80/20 split</strong> — proporsi standar dalam machine learning (sesuai jurnal hal. 130).</li>
              <li>• <strong>Data testing tidak boleh digunakan saat training</strong> — jika iya, model akan "menghafal" dan akurasinya palsu (data leakage).</li>
              <li>• <strong>Seed=42</strong> memastikan setiap kali dijalankan, hasil split-nya SAMA (reproducibility).</li>
              <li>• <strong>Proporsi kelas dijaga</strong> — distribusi kelas di training dan testing mencerminkan distribusi asli.</li>
            </ul>
          </div>

          {/* Visualisasi Split */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200">
              <div className="text-xs font-semibold text-slate-900 uppercase mb-2">Training (80%)</div>
              <div className="h-8 bg-slate-900 w-[80%] flex items-center justify-center">
                <span className="text-white text-xs font-mono">{split.train.length} data</span>
              </div>
            </div>
            <div className="p-4 border border-slate-200">
              <div className="text-xs font-semibold text-slate-900 uppercase mb-2">Testing (20%)</div>
              <div className="h-8 bg-slate-400 w-[20%] flex items-center justify-center">
                <span className="text-white text-xs font-mono">{split.test.length} data</span>
              </div>
            </div>
          </div>

          {/* Distribusi kelas per split */}
          <div className="overflow-x-auto">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Distribusi Kelas per Split:</h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left border border-slate-300">Kelas</th>
                  <th className="p-2 text-center border border-slate-300">Training</th>
                  <th className="p-2 text-center border border-slate-300">Testing</th>
                </tr>
              </thead>
              <tbody>
                {classNames.map((name, i) => {
                  const trainCount = split.train.filter(r => r.status === i).length;
                  const testCount = split.test.filter(r => r.status === i).length;
                  return (
                    <tr key={i}>
                      <td className="p-2 border border-slate-300 font-semibold">{name}</td>
                      <td className="p-2 text-center border border-slate-300 font-mono">{trainCount}</td>
                      <td className="p-2 text-center border border-slate-300 font-mono">{testCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ======================================== */}
      {/* TAHAP 4: SMOTE */}
      {/* ======================================== */}
      <Section title="Tahap 4 — SMOTE (Penanganan Imbalance)" icon={Layers}>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Alur Tahapan:</h3>
            <div className="text-xs text-slate-700 space-y-1">
              <p><strong>Input:</strong> Data training ({split.train.length} data) dengan distribusi kelas tidak seimbang.</p>
              <p><strong>Proses:</strong> Untuk kelas minoritas → cari K tetangga terdekat → interpolasi linear → generate sampel sintetis.</p>
              <p><strong>Output:</strong> Data training seimbang ({smoteTraining.length} data).</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Mengapa output-nya begini?</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>Sebelum SMOTE:</strong> Kelas "Belum Tahu" hanya 1-2 data → KNN akan sulit mengenali pola kelas ini.</li>
              <li>• <strong>SMOTE membuat data SINTETIS</strong> (bukan duplikat!) dengan interpolasi antara sampel minoritas dan tetangganya.</li>
              <li>• <strong>Rumus SMOTE:</strong> x_sintetis = x_i + random(0,1) × (x_nn - x_i)</li>
              <li>• <strong>Sesudah SMOTE:</strong> Semua kelas memiliki jumlah data yang sama → model belajar adil.</li>
              <li>• <strong>Sama dengan jurnal (hal. 130):</strong> "SMOTETomek sebagai metode resampling untuk mengatasi data yang mengandung noise dan masalah ketidakseimbangan kelas."</li>
            </ul>
          </div>

          {/* Visualisasi Sebelum/Sesudah SMOTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sebelum */}
            <div className="p-4 border border-slate-200">
              <h4 className="text-xs font-semibold text-slate-900 uppercase mb-3">Sebelum SMOTE (Training)</h4>
              <div className="space-y-2">
                {classNames.map((name, i) => {
                  const count = split.train.filter(r => r.status === i).length;
                  const maxCount = Math.max(...classNames.map((_, j) => split.train.filter(r => r.status === j).length));
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono w-20 text-right text-slate-600">{name}</span>
                      <div className="flex-1 bg-slate-100 h-4 relative">
                        <div className="bg-red-300 h-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                        <span className="absolute right-1 top-0 h-4 flex items-center text-[10px] font-mono text-slate-700">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sesudah */}
            <div className="p-4 border border-slate-200">
              <h4 className="text-xs font-semibold text-slate-900 uppercase mb-3">Sesudah SMOTE (Training)</h4>
              <div className="space-y-2">
                {classNames.map((name, i) => {
                  const count = smoteTraining.filter(r => r.status === i).length;
                  const maxCount = Math.max(...classNames.map((_, j) => smoteTraining.filter(r => r.status === j).length));
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono w-20 text-right text-slate-600">{name}</span>
                      <div className="flex-1 bg-slate-100 h-4 relative">
                        <div className="bg-slate-900 h-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                        <span className="absolute right-1 top-0 h-4 flex items-center text-[10px] font-mono text-white">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Formula SMOTE */}
          <div className="p-4 bg-slate-900 text-white">
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2">Formula SMOTE</h4>
            <p className="font-mono text-sm">
              x_sintetis = x_i + random(0,1) × (x_nn - x_i)
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              x_i = sampel minoritas, x_nn = tetangga terdekat, random(0,1) = angka acak 0-1
            </p>
          </div>
        </div>
      </Section>

      {/* ======================================== */}
      {/* TAHAP 5: NORMALISASI */}
      {/* ======================================== */}
      <Section title="Tahap 5 — Normalisasi (Min-Max)" icon={Layers}>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Alur Tahapan:</h3>
            <div className="text-xs text-slate-700 space-y-1">
              <p><strong>Input:</strong> Data training seimbang ({smoteTraining.length} data) dengan nilai asli.</p>
              <p><strong>Proses:</strong> Hitung min/max per fitur → terapkan rumus (x - min) / (max - min) ke SEMUA data.</p>
              <p><strong>Output:</strong> Semua fitur bernilai antara 0 dan 1.</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Mengapa output-nya begini?</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>Tanpa normalisasi:</strong> Umur (21-62) akan mendominasi jarak Euclidean dibanding Jenis Kelamin (0-1).</li>
              <li>• <strong>Contoh:</strong> Selisih umur 40 vs 30 = 10, tapi selisih jenis kelamin 0 vs 1 = 1. Jarak umur 10x lebih besar!</li>
              <li>• <strong>Min-Max menormalisasi</strong> semua fitur ke range [0,1] → semua fitur punya bobot yang adil.</li>
              <li>• <strong>Rumus:</strong> x_normalized = (x - x_min) / (x_max - x_min)</li>
            </ul>
          </div>

          {/* Bounds */}
          <div className="p-4 border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Bounds (Min/Max per Fitur dari Data Training):</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-2 text-left border border-slate-300">Fitur</th>
                    <th className="p-2 text-center border border-slate-300">Min</th>
                    <th className="p-2 text-center border border-slate-300">Max</th>
                    <th className="p-2 text-center border border-slate-300">Range</th>
                  </tr>
                </thead>
                <tbody>
                  {['umur', 'jenis_kelamin', 'kelompok_populasi', 'alasan_kunjungan'].map((fitur, i) => (
                    <tr key={i}>
                      <td className="p-2 border border-slate-300 font-semibold">{fitur}</td>
                      <td className="p-2 text-center border border-slate-300 font-mono">{normalization.bounds.min[i]}</td>
                      <td className="p-2 text-center border border-slate-300 font-mono">{normalization.bounds.max[i]}</td>
                      <td className="p-2 text-center border border-slate-300 font-mono">{normalization.bounds.max[i] - normalization.bounds.min[i]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formula */}
          <div className="p-4 bg-slate-900 text-white">
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2">Formula Normalisasi</h4>
            <p className="font-mono text-sm">
              x_normalized = (x - x_min) / (x_max - x_min)
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Output selalu antara 0 dan 1. Jika x = x_min → 0. Jika x = x_max → 1.
            </p>
          </div>
        </div>
      </Section>

      {/* ======================================== */}
      {/* CONFUSION MATRIX */}
      {/* ======================================== */}
      <Section title="Confusion Matrix" icon={Table2} defaultOpen={true}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Matriks 3×3 yang menunjukkan berapa banyak prediksi BENAR dan SALAH untuk setiap kelas.
            Baris = label Aktual, Kolom = label Prediksi.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-3 text-left font-semibold text-slate-900 border border-slate-300">Aktual ↓ / Prediksi →</th>
                  {classNames.map((name, i) => (
                    <th key={i} className="p-3 text-center font-semibold text-slate-900 border border-slate-300">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evaluation.confusionMatrix.map((row, i) => (
                  <tr key={i}>
                    <td className="p-3 font-semibold text-slate-900 bg-slate-50 border border-slate-300">{classNames[i]}</td>
                    {row.map((val, j) => (
                      <td
                        key={j}
                        className={`p-3 text-center border border-slate-300 font-mono ${
                          i === j ? 'bg-slate-900 text-white font-bold' : val > 0 ? 'bg-red-50 text-red-700' : 'bg-white'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Penjelasan */}
          <div className="p-4 bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Cara Membaca:</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>Sel diagonal (gelap)</strong> = prediksi BENAR (TP)</li>
              <li>• <strong>Sel off-diagonal (merah)</strong> = prediksi SALAH (FP/FN)</li>
              <li>• Angka di diagonal / total = Accuracy</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ======================================== */}
      {/* METRIK PERFORMA */}
      {/* ======================================== */}
      <Section title="Metrik Performa" icon={Target} defaultOpen={true}>
        <div className="space-y-4">
          {/* Pilih K */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-900">Nilai K:</label>
            <select
              value={selectedK}
              onChange={(e) => setSelectedK(parseInt(e.target.value, 10))}
              className="px-4 py-2 border-2 border-slate-200 focus:border-slate-900 outline-none font-mono"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500">(K optimal: {kOptimization.optimalK})</span>
          </div>

          {/* Kartu Metrik */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Akurasi', value: evaluation.accuracy, rumus: 'TP+TN / Total' },
              { label: 'Precision', value: evaluation.macroPrecision, rumus: 'TP / (TP+FP)' },
              { label: 'Recall', value: evaluation.macroRecall, rumus: 'TP / (TP+FN)' },
              { label: 'F1-Score', value: evaluation.macroF1Score, rumus: '2×(P×R)/(P+R)' },
            ].map((stat, idx) => (
              <div key={idx} className={`p-4 ${idx === 0 ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200'}`}>
                <div className={`text-xs uppercase tracking-widest mb-1 ${idx === 0 ? 'text-slate-300' : 'text-slate-500'}`}>{stat.label}</div>
                <div className={`text-2xl font-bold font-mono ${idx === 0 ? 'text-white' : 'text-slate-900'}`}>{(stat.value * 100).toFixed(2)}%</div>
                <div className={`text-[10px] mt-1 font-mono ${idx === 0 ? 'text-slate-400' : 'text-slate-500'}`}>{stat.rumus}</div>
              </div>
            ))}
          </div>

          {/* Penjelasan Metrik */}
          <div className="p-4 bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Penjelasan Setiap Metrik:</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>Accuracy ({(evaluation.accuracy * 100).toFixed(2)}%):</strong> Dari SEMUA prediksi, berapa yang BENAR? → {Math.round(evaluation.accuracy * split.test.length)} dari {split.test.length} data.</li>
              <li>• <strong>Precision ({(evaluation.macroPrecision * 100).toFixed(2)}%):</strong> Dari yang diprediksi "Positif", berapa yang BENAR "Positif"? → Mengukur false alarm.</li>
              <li>• <strong>Recall ({(evaluation.macroRecall * 100).toFixed(2)}%):</strong> Dari yang BENAR "Positif", berapa yang BERHASIL ditemukan? → Mengukur ketelitian deteksi.</li>
              <li>• <strong>F1-Score ({(evaluation.macroF1Score * 100).toFixed(2)}%):</strong> Rata-rata harmonis Precision dan Recall → keseimbangan keduanya.</li>
            </ul>
          </div>

          {/* Per Kelas */}
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Detail Per Kelas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-3 text-left border border-slate-300">Kelas</th>
                  <th className="p-3 text-center border border-slate-300">TP</th>
                  <th className="p-3 text-center border border-slate-300">FP</th>
                  <th className="p-3 text-center border border-slate-300">FN</th>
                  <th className="p-3 text-center border border-slate-300">Precision</th>
                  <th className="p-3 text-center border border-slate-300">Recall</th>
                  <th className="p-3 text-center border border-slate-300">F1</th>
                </tr>
              </thead>
              <tbody>
                {evaluation.perClass.map((m) => (
                  <tr key={m.label} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold border border-slate-300">{m.name}</td>
                    <td className="p-3 text-center font-mono border border-slate-300">{m.tp}</td>
                    <td className="p-3 text-center font-mono border border-slate-300">{m.fp}</td>
                    <td className="p-3 text-center font-mono border border-slate-300">{m.fn}</td>
                    <td className="p-3 text-center font-mono border border-slate-300">{(m.precision * 100).toFixed(2)}%</td>
                    <td className="p-3 text-center font-mono border border-slate-300">{(m.recall * 100).toFixed(2)}%</td>
                    <td className="p-3 text-center font-mono border border-slate-300">{(m.f1Score * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ======================================== */}
      {/* OPTIMASI K */}
      {/* ======================================== */}
      <Section title="Optimasi Nilai K" icon={TrendingUp}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Cross-Validation (5-Fold) untuk menentukan K optimal berdasarkan F1-Score.
            Uji K dari 1 sampai 15, pilih yang F1-Score tertinggi.
          </p>

          {/* Grafik */}
          <div className="space-y-2">
            {kOptimization.results.map((r) => (
              <div key={r.k} className="flex items-center gap-3">
                <span className={`text-xs font-mono w-8 text-right ${r.k === kOptimization.optimalK ? 'font-bold text-slate-900' : 'text-slate-500'}`}>K={r.k}</span>
                <div className="flex-1 bg-slate-100 h-5 relative">
                  <div className={`h-full ${r.k === kOptimization.optimalK ? 'bg-slate-900' : 'bg-slate-400'}`} style={{ width: `${r.f1Score * 100}%` }} />
                  <span className="absolute right-2 top-0 h-5 flex items-center text-xs font-mono text-slate-700">{(r.f1Score * 100).toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-700"><strong>K Optimal: {kOptimization.optimalK}</strong> — F1-Score {(kOptimization.optimalF1Score * 100).toFixed(2)}%</p>
            <p className="text-xs text-slate-500 mt-1">K optimal = nilai K dengan F1-Score tertinggi dari 5-Fold Cross-Validation.</p>
          </div>
        </div>
      </Section>

      {/* ======================================== */}
      {/* KORELASI */}
      {/* ======================================== */}
      <Section title="Korelasi Antar Fitur" icon={Table2}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Koefisien Korelasi Pearson — mengukur kekuatan hubungan linear antara dua variabel.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-3 border border-slate-300 text-xs"></th>
                  {correlations.features.map((f, i) => (
                    <th key={i} className="p-3 text-center border border-slate-300 text-xs">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlations.matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="p-3 font-semibold bg-slate-50 border border-slate-300 text-xs">{correlations.features[i]}</td>
                    {row.map((val, j) => {
                      const absVal = Math.abs(val);
                      let bgColor = 'bg-white';
                      if (i !== j) {
                        if (absVal > 0.7) bgColor = 'bg-red-100';
                        else if (absVal > 0.3) bgColor = 'bg-yellow-50';
                        else bgColor = 'bg-green-50';
                      }
                      return (
                        <td key={j} className={`p-3 text-center border border-slate-300 font-mono text-xs ${bgColor} ${i === j ? 'bg-slate-900 text-white font-bold' : ''}`}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Temuan Penting:</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>Status ODHIV ↔ Alasan Kunjungan:</strong> -0.86 → sangat kuat terbalik (satu naik, lainnya turun).</li>
              <li>• <strong>Jenis Kelamin ↔ Status ODHIV:</strong> -0.30 → moderat.</li>
              <li>• <strong>Umur ↔ Variabel lain:</strong> ~0 → hampir tidak berkorelasi.</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}
