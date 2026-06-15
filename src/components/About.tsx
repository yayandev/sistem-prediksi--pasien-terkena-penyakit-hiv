/**
 * About.tsx
 * =========
 * Halaman "About VECTRA" — informasi tentang pembuat sistem,
 * mata kuliah, universitas, dan kelompok.
 *
 * VECTRA dibuat untuk memenuhi tugas mata kuliah Machine Learning
 * di Universitas UNBAJA oleh Kelompok 5.
 */

import React from 'react';
import { Users, BookOpen, GraduationCap, Heart } from 'lucide-react';

/**
 * Data anggota kelompok 5.
 * UPDATE NAMA DI SINI begitu nama dikirim.
 */
const TEAM_MEMBERS = [
  {
    name: '[Nama Anggota 1]',
    nim: '[NIM]',
    role: 'Ketua Kelompok',
  },
  {
    name: '[Nama Anggota 2]',
    nim: '[NIM]',
    role: 'Anggota',
  },
  {
    name: '[Nama Anggota 3]',
    nim: '[NIM]',
    role: 'Anggota',
  },
  {
    name: '[Nama Anggota 4]',
    nim: '[NIM]',
    role: 'Anggota',
  },
];

export default function About() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 sm:pb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight uppercase">Tentang VECTRA</h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Sistem Pendukung Keputusan Klinis untuk Evaluasi Risiko HIV
          berbasis Algoritma K-Nearest Neighbors (KNN).
        </p>
      </div>

      {/* Informasi Umum */}
      <div className="bg-white border-2 border-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <BookOpen className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase">Informasi Project</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mata Kuliah</div>
                <div className="text-sm font-semibold text-slate-900">Machine Learning</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Universitas</div>
                <div className="text-sm font-semibold text-slate-900">Universitas UNBAJA</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Kelompok</div>
                <div className="text-sm font-semibold text-slate-900">Kelompok 5</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Algoritma</div>
                <div className="text-sm font-semibold text-slate-900">K-Nearest Neighbors (KNN)</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Jurnal Referensi</div>
                <div className="text-sm font-semibold text-slate-900">Jurnal PARADIGMA, Vol 6 No 1, 2025</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tech Stack</div>
                <div className="text-sm font-semibold text-slate-900">React + TypeScript + Custom ML</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anggota Kelompok */}
      <div className="bg-white border-2 border-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <Users className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase">Anggota Kelompok 5</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TEAM_MEMBERS.map((member, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{member.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{member.nim}</div>
                  <div className="text-xs text-slate-600 mt-1">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visi & Misi */}
      <div className="bg-white border-2 border-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <GraduationCap className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase">Visi & Misi Project</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Tujuan</h4>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Mengimplementasikan algoritma K-Nearest Neighbors (KNN) dari scratch tanpa library external</li>
              <li>Membangun sistem prediksi risiko HIV yang berjalan di browser (client-side)</li>
              <li>Menerapkan pipeline preprocessing lengkap: Data Cleaning, LabelEncoder, Splitting, SMOTE, Normalisasi</li>
              <li>Menjadi alat edukasi untuk memahami konsep Machine Learning dalam konteks kesehatan</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Fitur Utama</h4>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>8 algoritma ML diimplementasi dari scratch dengan komentar penjelasan rumus</li>
              <li>Pipeline preprocessing 5 tahap sesuai metodologi jurnal</li>
              <li>Evaluasi model: Confusion Matrix, Accuracy, Precision, Recall, F1-Score</li>
              <li>Optimasi K menggunakan K-Fold Cross-Validation</li>
              <li>SMOTE untuk penanganan class imbalance</li>
              <li>Analisis korelasi antar fitur menggunakan Pearson Correlation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Catatan Medis */}
      <div className="p-4 bg-slate-50 border border-slate-200">
        <div className="flex items-start gap-3">
          <Heart className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Catatan Penting</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sistem ini dirancang secara eksklusif untuk tujuan edukasi dan tugas kuliah Machine Learning.
              Bukan pengganti diagnosis medis profesional. Untuk diagnosis HIV yang akurat,
              silakan konsultasi dengan tenaga medis bersertifikat dan melakukan uji klinis
              seperti ELISA atau Western Blot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
