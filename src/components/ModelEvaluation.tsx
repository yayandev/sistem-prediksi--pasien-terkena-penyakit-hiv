/**
 * ModelEvaluation.tsx
 * ===================
 * Komponen tab "Evaluasi Model" — menampilkan hasil evaluasi KNN dari scratch.
 *
 * Fitur:
 *   1. Confusion Matrix — matriks 3×3 aktual vs prediksi
 *   2. Metrik Performa — Accuracy, Precision, Recall, F1-Score (macro average)
 *   3. Metrik Per Kelas — detail untuk setiap kelas (Belum Tahu, Bukan ODHIV, ODHIV)
 *   4. Optimasi K — grafik F1-Score vs nilai K menggunakan Cross-Validation
 *   5. Distribusi Data — jumlah data per kelas sebelum dan sesudah SMOTE
 *
 * Catatan: Semua metrik dihitung dari SCRATCH menggunakan custom functions.
 *          Tidak ada library ML external yang digunakan.
 */

import React, { useState, useMemo } from 'react';
import { evaluateModel } from '../utils/evaluation';
import { findOptimalK } from '../utils/validation';
import { smoteAllClasses } from '../utils/sMOTE';
import { correlationMatrix } from '../utils/correlation';
import hivDataset from '../data/hiv_dataset.json';
import { BarChart3, Table2, Target, TrendingUp } from 'lucide-react';

/**
 * Komponen utama ModelEvaluation.
 */
export default function ModelEvaluation() {
  // State untuk nilai K yang dipilih user
  const [selectedK, setSelectedK] = useState<number>(3);

  // === HITUNG EVALUASI MODEL DARI SCRATCH ===
  // useMemo agar tidak dihitung ulang setiap render
  const evaluation = useMemo(() => {
    return evaluateModel(hivDataset, selectedK, 42);
  }, [selectedK]);

  // === HITUNG OPTIMASI K DARI SCRATCH ===
  const kOptimization = useMemo(() => {
    return findOptimalK(hivDataset, 15, 5, 42);
  }, []);

  // === HITUNG DISTRIBUSI DATA + SMOTE ===
  const distribution = useMemo(() => {
    // Hitung distribusi asli
    const original: Record<number, number> = {};
    for (const row of hivDataset) {
      original[row.status] = (original[row.status] || 0) + 1;
    }

    // Jalankan SMOTE
    const smoteDataset = smoteAllClasses(hivDataset, 3, 42);

    // Hitung distribusi setelah SMOTE
    const afterSmote: Record<number, number> = {};
    for (const row of smoteDataset) {
      afterSmote[row.status] = (afterSmote[row.status] || 0) + 1;
    }

    return { original, afterSmote, smoteTotal: smoteDataset.length };
  }, []);

  // === HITUNG KORELASI DARI SCRATCH ===
  const correlations = useMemo(() => {
    return correlationMatrix(hivDataset);
  }, []);

  // Nama kelas
  const classNames = ['Belum Tahu', 'Bukan ODHIV', 'ODHIV'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 sm:pb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight uppercase">Evaluasi Model KNN</h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Hasil evaluasi model K-Nearest Neighbors yang diimplementasikan dari scratch.
          Semua metrik dihitung menggunakan rumus matematika, bukan library external.
        </p>
      </div>

      {/* === SECTION 1: CONFUSION MATRIX === */}
      <div className="bg-white border-2 border-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <Table2 className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase">Confusion Matrix</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Matriks yang menunjukkan jumlah prediksi benar dan salah untuk setiap kelas.
            Baris = aktual, Kolom = prediksi.
          </p>

          {/* Tabel Confusion Matrix */}
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
                          i === j
                            ? 'bg-slate-900 text-white font-bold'
                            : val > 0
                            ? 'bg-red-50 text-red-700'
                            : 'bg-white'
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

          <p className="text-xs text-slate-500 mt-3">
            Sel diagonal (gelap) = prediksi benar. Sel off-diagonal = prediksi salah.
          </p>
        </div>
      </div>

      {/* === SECTION 2: METRIK PERFORMA === */}
      <div className="bg-white border-2 border-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <Target className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase">Metrik Performa</h2>
        </div>
        <div className="p-6">
          {/* Pilih K */}
          <div className="mb-6 flex items-center gap-4">
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
            <span className="text-xs text-slate-500">
              (K optimal dari CV: {kOptimization.optimalK})
            </span>
          </div>

          {/* Kartu Metrik Utama */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Akurasi', value: evaluation.accuracy, desc: 'Prediksi benar / Total' },
              { label: 'Precision', value: evaluation.macroPrecision, desc: 'Macro Average' },
              { label: 'Recall', value: evaluation.macroRecall, desc: 'Macro Average' },
              { label: 'F1-Score', value: evaluation.macroF1Score, desc: 'Macro Average' },
            ].map((stat, idx) => (
              <div key={idx} className={`p-4 ${idx === 0 ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200'}`}>
                <div className={`text-xs uppercase tracking-widest mb-1 ${idx === 0 ? 'text-slate-300' : 'text-slate-500'}`}>
                  {stat.label}
                </div>
                <div className={`text-2xl font-bold font-mono ${idx === 0 ? 'text-white' : 'text-slate-900'}`}>
                  {(stat.value * 100).toFixed(2)}%
                </div>
                <div className={`text-xs mt-1 ${idx === 0 ? 'text-slate-400' : 'text-slate-500'}`}>
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Metrik Per Kelas */}
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Detail Per Kelas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-3 text-left font-semibold text-slate-900 border border-slate-300">Kelas</th>
                  <th className="p-3 text-center font-semibold text-slate-900 border border-slate-300">TP</th>
                  <th className="p-3 text-center font-semibold text-slate-900 border border-slate-300">FP</th>
                  <th className="p-3 text-center font-semibold text-slate-900 border border-slate-300">FN</th>
                  <th className="p-3 text-center font-semibold text-slate-900 border border-slate-300">Precision</th>
                  <th className="p-3 text-center font-semibold text-slate-900 border border-slate-300">Recall</th>
                  <th className="p-3 text-center font-semibold text-slate-900 border border-slate-300">F1-Score</th>
                </tr>
              </thead>
              <tbody>
                {evaluation.perClass.map((m) => (
                  <tr key={m.label} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900 border border-slate-300">{m.name}</td>
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
      </div>

      {/* === SECTION 3: OPTIMASI K === */}
      <div className="bg-white border-2 border-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <TrendingUp className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase">Optimasi Nilai K</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Cross-Validation (5-Fold) untuk menentukan K optimal berdasarkan F1-Score.
          </p>

          {/* Grafik K vs F1-Score (ASCII bar chart) */}
          <div className="space-y-2">
            {kOptimization.results.map((r) => (
              <div key={r.k} className="flex items-center gap-3">
                <span className={`text-xs font-mono w-8 text-right ${r.k === kOptimization.optimalK ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                  K={r.k}
                </span>
                <div className="flex-1 bg-slate-100 h-5 relative">
                  <div
                    className={`h-full ${r.k === kOptimization.optimalK ? 'bg-slate-900' : 'bg-slate-400'}`}
                    style={{ width: `${r.f1Score * 100}%` }}
                  />
                  <span className="absolute right-2 top-0 h-5 flex items-center text-xs font-mono text-slate-700">
                    {(r.f1Score * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-700">
              <strong>K Optimal: {kOptimization.optimalK}</strong> — dengan F1-Score {(kOptimization.optimalF1Score * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              K optimal dipilih berdasarkan nilai K dengan F1-Score tertinggi dari 5-Fold Cross-Validation.
            </p>
          </div>
        </div>
      </div>

      {/* === SECTION 4: DISTRIBUSI DATA + SMOTE === */}
      <div className="bg-white border-2 border-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <BarChart3 className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase">Distribusi Data & SMOTE</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            SMOTE (Synthetic Minority Over-sampling Technique) digunakan untuk menyeimbangkan kelas minoritas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sebelum SMOTE */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Sebelum SMOTE</h3>
              <div className="space-y-2">
                {classNames.map((name, i) => {
                  const count = distribution.original[i] || 0;
                  const maxCount = Math.max(...Object.values(distribution.original) as number[]);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-mono w-24 text-right text-slate-600">{name}</span>
                      <div className="flex-1 bg-slate-100 h-5 relative">
                        <div
                          className="bg-slate-400 h-full"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                        <span className="absolute right-2 top-0 h-5 flex items-center text-xs font-mono text-slate-700">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-2">Total: {hivDataset.length} data</p>
            </div>

            {/* Sesudah SMOTE */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Sesudah SMOTE</h3>
              <div className="space-y-2">
                {classNames.map((name, i) => {
                  const count = distribution.afterSmote[i] || 0;
                  const maxCount = Math.max(...Object.values(distribution.afterSmote) as number[]);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-mono w-24 text-right text-slate-600">{name}</span>
                      <div className="flex-1 bg-slate-100 h-5 relative">
                        <div
                          className="bg-slate-900 h-full"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                        <span className="absolute right-2 top-0 h-5 flex items-center text-xs font-mono text-white">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-2">Total: {distribution.smoteTotal} data</p>
            </div>
          </div>
        </div>
      </div>

      {/* === SECTION 5: KORELASI ANTAR FITUR === */}
      <div className="bg-white border-2 border-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <Table2 className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase">Korelasi Antar Fitur</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Koefisien Korelasi Pearson — mengukur kekuatan hubungan linear antara dua variabel.
            Range: -1 (negatif sempurna) hingga +1 (positif sempurna).
          </p>

          {/* Matriks Korelasi */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-3 text-left font-semibold text-slate-900 border border-slate-300 text-xs"></th>
                  {correlations.features.map((f, i) => (
                    <th key={i} className="p-3 text-center font-semibold text-slate-900 border border-slate-300 text-xs">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlations.matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="p-3 font-semibold text-slate-900 bg-slate-50 border border-slate-300 text-xs">{correlations.features[i]}</td>
                    {row.map((val, j) => {
                      // Warna berdasarkan nilai korelasi
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

          {/* Temuan Penting */}
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Temuan Penting:</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>Status ODHIV ↔ Alasan Kunjungan:</strong> -0.86 (sangat kuat, terbalik)</li>
              <li>• <strong>Jenis Kelamin ↔ Status ODHIV:</strong> -0.30 (moderat)</li>
              <li>• <strong>Jenis Kelamin ↔ Alasan Kunjungan:</strong> 0.30 (moderat)</li>
              <li>• <strong>Umur ↔ Variabel lain:</strong> ~0 (hampir tidak berkorelasi)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
