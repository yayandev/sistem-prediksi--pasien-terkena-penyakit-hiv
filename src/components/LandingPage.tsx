/**
 * LandingPage.tsx
 * ==============
 * Landing page — tampil sebelum login.
 * Hero, Features, Cara Kerja, Stats, dan CTA.
 * Fully responsive dengan animasi CSS.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Stethoscope, Brain, Shield, Zap, Activity, Database, ArrowRight, Heart, Users, BarChart3, Sparkles, CheckCircle } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'KNN dari Scratch',
    desc: 'Algoritma K-Nearest Neighbors dikodekan manual tanpa library ML — lengkap dengan Euclidean Distance, Majority Voting, dan Tie-Breaking.',
    color: 'bg-violet-100 text-violet-600',
  },
  {
    icon: Database,
    title: '13 Fitur Klinis',
    desc: 'Mencakup data demografis, riwayat kesehatan, perilaku seksual, dan gejala klinis — lebih lengkap dari pendekatan tradisional.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Shield,
    title: 'Preprocessing Lengkap',
    desc: '5 tahap: Data Cleaning → LabelEncoder → Splitting 80/20 → SMOTE → Min-Max Normalization — sesuai pipeline jurnal.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Zap,
    title: 'Prediksi Real-Time',
    desc: '200 data training diproses langsung di browser. Tidak ada server, tidak ada latensi — privasi pasien terjaga.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Users,
    title: '2 Role Akses',
    desc: 'Admin bisa kelola data pasien, user, dan evaluasi model. Pasien bisa prediksi dan melihat riwayat sendiri.',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: BarChart3,
    title: 'Evaluasi Model',
    desc: 'Confusion Matrix, Precision, Recall, F1-Score, 5-Fold Cross-Validation, dan Optimasi K — semuanya transparan.',
    color: 'bg-cyan-100 text-cyan-600',
  },
];

const STEPS = [
  { num: '01', title: 'Input Data', desc: 'Pasien mengisi 13 fitur melalui form multi-step wizard yang intuitif.' },
  { num: '02', title: 'Proses KNN', desc: 'Sistem menghitung jarak Euclidean ke 200 data training, mengambil 3 tetangga terdekat, dan melakukan voting.' },
  { num: '03', title: 'Hasil Prediksi', desc: 'Menampilkan hasil klasifikasi beserta detail tetangga, voting, dan confidence score.' },
];

const STATS = [
  { value: '200', label: 'Data Training', icon: Database },
  { value: '13', label: 'Fitur Input', icon: BarChart3 },
  { value: '8', label: 'Algoritma ML', icon: Brain },
  { value: '3', label: 'Kelas Prediksi', icon: Target },
];

function Target({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ============ NAVBAR ============ */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">VECTRA</span>
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/login" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Masuk
            </NavLink>
            <NavLink to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-900/20 active:scale-95">
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-slate-900/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-slate-900/3 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-36 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-semibold text-slate-600 uppercase tracking-widest mb-8 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Tugas Machine Learning — Universitas Banten Jaya
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Sistem Prediksi
              <br />
              <span className="relative inline-block">
                Pasien Terkena
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="currentColor" strokeWidth="3" className="text-slate-900" strokeLinecap="round" />
                </svg>
              </span>
              {' '}Penyakit <span className="text-slate-900">HIV</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Memanfaatkan algoritma <strong className="text-slate-900">K-Nearest Neighbors</strong> untuk mengklasifikasi risiko HIV dengan 13 fitur klinis — diproses langsung di browser tanpa server.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NavLink to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 active:scale-[0.98] text-base">
                <Stethoscope className="w-5 h-5" />
                Mulai Prediksi
              </NavLink>
              <NavLink to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-2xl hover:border-slate-900 hover:bg-slate-50 transition-all text-base">
                Pelajari Lebih Lanjut
              </NavLink>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-slate-400">
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 200 Data Training</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 13 Fitur Klinis</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 100% Client-Side</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Open Source</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="py-16 sm:py-20 border-y border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white border border-slate-200 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              Fitur Utama
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Kenapa VECTRA?
            </h2>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
              Sistem prediksi HIV yang transparan, akurat, dan mudah digunakan — dari preprocessing hingga evaluasi model.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl hover:border-slate-900 hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-20 sm:py-28 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white/60 uppercase tracking-widest mb-4">
              Cara Kerja
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              3 Langkah Sederhana
            </h2>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              Dari input data hingga hasil prediksi — semuanya diproses dalam hitungan detik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative group">
                {i < 2 && <div className="hidden md:block absolute top-12 left-[calc(50%+60px)] right-[calc(-50%+60px)] h-px bg-white/10" />}
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-colors">
                  <div className="text-5xl font-black text-white/10 mb-4">{step.num}</div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DATASET INFO ============ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                Dataset
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-6">
                200 Data Training
                <br />
                <span className="text-slate-400">13 Fitur Klinis</span>
              </h2>
              <p className="text-base text-slate-500 leading-relaxed mb-6">
                Data berasal dari poli VCT RSUD Dr. Chasbullah Abdul Madjid Kota Bekasi (2.205 rekam medis). Kita buat 200 data sintetis berdasarkan distribusi pola asli dengan 13 fitur lengkap.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['Umur', 'Jenis Kelamin', 'Kelompok Populasi', 'Alasan Kunjungan', 'Riwayat Tes HIV', 'Riwayat IMS', 'Jumlah Pasangan', 'Penggunaan Kondom', 'NAPZA Suntik', 'Status Pernikahan', 'Usia Pertama Hub.', 'Terapi ARV', 'Gejala Klinis'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white">
                <Activity className="w-8 h-8 text-white/30 mb-4" />
                <div className="text-3xl font-black mb-1">KNN</div>
                <div className="text-sm text-white/50">K-Nearest Neighbors — K=3</div>
                <div className="mt-4 flex gap-2">
                  <div className="px-3 py-1 bg-white/10 rounded-lg text-xs">Euclidean Distance</div>
                  <div className="px-3 py-1 bg-white/10 rounded-lg text-xs">Majority Vote</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white">
                <div className="text-2xl font-black">5</div>
                <div className="text-xs text-white/70 uppercase tracking-wider mt-1">Tahap Preprocessing</div>
              </div>
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-3xl p-6 text-white">
                <div className="text-2xl font-black">3</div>
                <div className="text-xs text-white/70 uppercase tracking-wider mt-1">Kelas Prediksi</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-slate-900 rounded-[2rem] p-10 sm:p-16 text-center overflow-hidden">
            {/* Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <Heart className="w-10 h-10 text-rose-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Siap Membantu?
              </h2>
              <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
                Mulai gunakan VECTRA untuk memprediksi risiko HIV dengan lebih cepat dan akurat.
              </p>
              <NavLink to="/login" className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all hover:shadow-xl hover:shadow-black/10 active:scale-[0.98] text-base">
                <Stethoscope className="w-5 h-5" />
                Masuk ke Sistem
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-slate-200 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">VECTRA</span>
          </div>
          <div className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Kelompok 5 — Universitas Banten Jaya &bull; Tugas Machine Learning
          </div>
        </div>
      </footer>
    </div>
  );
}
