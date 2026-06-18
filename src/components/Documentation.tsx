/**
 * Documentation.tsx
 * =================
 * Halaman "Pusat Pengetahuan" — penjelasan tentang sistem VECTRA,
 * alur kerja, preprocessing, dan cara kerja di balik layar.
 *
 * Ditulis dengan bahasa yang natural dan mudah dipahami,
 * bukan bahasa robot atau AI.
 */

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Activity,
  GitCommit,
  ShieldCheck,
  Database,
  Layers,
  Code,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Stethoscope,
} from "lucide-react";
import { runFullPreprocessing } from "../utils/preprocessing";
import { evaluateModel } from "../utils/evaluation";
import rawDataset from "../data/raw_hiv_dataset.json";

const SECTIONS = [
  {
    id: "pengantar",
    label: "Pengantar",
    icon: Activity,
    title: "Pengantar Sistem",
  },
  {
    id: "arsitektur",
    label: "Arsitektur",
    icon: GitCommit,
    title: "Cara Kerja KNN",
  },
  {
    id: "preprocessing",
    label: "Prapemrosesan",
    icon: Layers,
    title: "Tahap Prapemrosesan",
  },
  {
    id: "performa",
    label: "Performa",
    icon: ShieldCheck,
    title: "Hasil Evaluasi",
  },
  {
    id: "referensi",
    label: "Referensi",
    icon: Database,
    title: "Fitur & Variabel",
  },
  { id: "kode", label: "Kode program", icon: Code, title: "Struktur Kode" },
];

export default function Documentation() {
  const [activeSectionId, setActiveSectionId] = useState("pengantar");

  const currentIndex = SECTIONS.findIndex((s) => s.id === activeSectionId);
  const activeSection = SECTIONS[currentIndex];

  const handleNext = () => {
    if (currentIndex < SECTIONS.length - 1)
      setActiveSectionId(SECTIONS[currentIndex + 1].id);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setActiveSectionId(SECTIONS[currentIndex - 1].id);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[70vh] md:min-h-[600px]">
      {/* Sidebar Navigation */}
      <div className="md:w-1/4 lg:w-1/5 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-200 hidden md:block bg-white shadow-sm z-10">
          <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-500" />
            Daftar Isi
          </h3>
        </div>

        {/* Mobile Nav Header */}
        <div className="p-4 md:hidden flex justify-between items-center bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Dokumentasi
            </span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Langkah {currentIndex + 1} / {SECTIONS.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex gap-2 md:block md:gap-0 md:py-4 md:px-3 overflow-x-auto scrollbar-hide snap-x items-center">
          {SECTIONS.map((item, idx) => {
            const isActive = activeSectionId === item.id;
            const isCompleted = currentIndex > idx;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSectionId(item.id)}
                className={`snap-start flex-shrink-0 md:w-full flex items-center gap-3 text-left px-5 py-3 md:px-4 md:py-3.5 rounded-full md:rounded-xl transition-all duration-200 mb-0 md:mb-1.5 ${
                  isActive
                    ? "bg-white shadow-md border border-slate-200 text-slate-900 font-bold scale-100"
                    : isCompleted
                      ? "bg-slate-100/50 text-slate-600 hover:bg-white hover:shadow-sm border border-transparent scale-95 md:scale-100"
                      : "bg-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-700 border border-transparent scale-95 md:scale-100"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-slate-800" : isCompleted ? "text-slate-500" : "text-slate-400"}`}
                />
                <span className="text-sm tracking-tight whitespace-nowrap flex-1">
                  {item.label}
                </span>
                {isCompleted && !isActive && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 hidden md:block shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="md:w-3/4 lg:w-4/5 flex flex-col relative bg-slate-50/30 overflow-hidden">
        <div className="flex-1 p-6 sm:p-10 lg:p-14 overflow-y-auto w-full">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 align-start mb-8 sm:mb-10">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-sm flex items-center justify-center shrink-0">
                <activeSection.icon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                {activeSection.title}
              </h2>
            </div>

            <div
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full"
              key={activeSectionId}
            >
              {activeSectionId === "pengantar" && <PengantarContent />}
              {activeSectionId === "arsitektur" && <ArsitekturContent />}
              {activeSectionId === "preprocessing" && <PreprocessingContent />}
              {activeSectionId === "performa" && <PerformaContent />}
              {activeSectionId === "referensi" && <ReferensiContent />}
              {activeSectionId === "kode" && <KodeContent />}
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              currentIndex === 0
                ? "text-slate-300 cursor-not-allowed opacity-50"
                : "text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          <div className="flex gap-1.5 sm:gap-2">
            {SECTIONS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-slate-800 w-4 sm:w-6" : idx < currentIndex ? "bg-slate-400 w-1.5 sm:w-2" : "bg-slate-200 w-1.5 sm:w-2"}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === SECTIONS.length - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              currentIndex === SECTIONS.length - 1
                ? "opacity-0 pointer-events-none"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-95"
            }`}
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <span className="sm:hidden">Lanjut</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------
// Content Components — ditulis dengan bahasa natural
// ----------------------------------------

function PengantarContent() {
  return (
    <div className="space-y-6 text-slate-600 font-light leading-relaxed">
      <p className="text-base sm:text-lg">
        HIV masih jadi masalah kesehatan yang serius di Indonesia. Setiap tahun
        ribuan orang terdiagnosis, dan proses skriningnya masih banyak yang
        manual. Nah, di sinilah teknologi bisa bantu — khususnya machine
        learning.
      </p>

      <p className="text-base sm:text-lg">
        VECTRA dibuat untuk membantu tenaga medis mempercepat proses klasifikasi
        risiko HIV. Caranya? Pakai algoritma{" "}
        <strong className="font-semibold text-slate-900">
          K-Nearest Neighbors (KNN)
        </strong>{" "}
        — salah satu algoritma paling sederhana tapi cukup akurat untuk kasus
        seperti ini. Sistem ini memproses{" "}
        <strong className="font-semibold text-slate-900">13 fitur input</strong>{" "}
        dari setiap pasien untuk menghasilkan prediksi yang lebih komprehensif.
      </p>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <h4 className="text-slate-900 font-bold mb-4 flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-slate-500" /> Kenapa Pakai KNN?
        </h4>
        <div className="text-sm sm:text-base space-y-3 text-slate-600">
          <p>
            KNN itu prinsipnya sederhana banget: kalau kamu mau tahu seseorang
            masuk kategori apa, cukup lihat orang-orang yang paling mirip
            dengannya. Kalau mayoritas tetangga terdekatnya ODHIV, maka orang
            itu juga diprediksi ODHIV.
          </p>
          <p>
            Data yang dipakai berasal dari poli VCT (Voluntary Counselling and
            Testing) di RSUD Dr. Chasbullah Abdul Madjid Kota Bekasi — total
            2.205 rekam medis pasien. Di sistem ini kita pakai 200 data sintetis
            yang dibuat berdasarkan distribusi pola data asli, dengan 13 fitur
            input lengkap mencakup aspek klinis, demografis, dan perilaku.
          </p>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
        <strong>Catatan:</strong> Sistem ini cuma untuk edukasi dan tugas
        kuliah. Bukan pengganti diagnosis dokter. Kalau butuh diagnosis akurat,
        tetap harus ke fasyankes dan uji lab kayak ELISA atau Western Blot.
      </div>
    </div>
  );
}

function ArsitekturContent() {
  return (
    <div className="space-y-6 text-slate-600 font-light leading-relaxed">
      <p className="text-base sm:text-lg">
        KNN itu termasuk <em>supervised learning</em> — artinya kita kasih
        contoh data yang sudah punya label, terus algoritma belajar dari contoh
        itu. Waktu ada data baru, dia tinggal cari siapa yang paling mirip di
        data latih.
      </p>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-800"></span>
          Cara Kerja KNN (Step by Step)
        </h4>
        <ul className="space-y-6 m-0 p-0 text-sm sm:text-base list-none">
          {[
            {
              title: "1. Hitung Jarak",
              desc: "Setiap data baru diukur jaraknya ke SEMUA data latih pakai Euclidean Distance. Rumusnya: √Σ(x₁ - x₂)². Makin kecil jaraknya, makin mirip.",
            },
            {
              title: "2. Urutkan Jarak",
              desc: "Jarak dari semua data latih diurutkan dari terkecil ke terbesar. Kita ambil K terdekat (default K=3).",
            },
            {
              title: "3. Voting Mayoritas",
              desc: "Dari K tetangga terdekat, lihat label mana yang paling banyak muncul. Itu yang jadi prediksi. Misal: 2 tetangga bilang ODHIV, 1 bilang Bukan → hasilnya ODHIV.",
            },
          ].map((item, idx) => (
            <li key={idx} className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                {idx + 1}
              </div>
              <div className="flex-1">
                <strong className="text-slate-900 font-semibold block mb-1">
                  {item.title}
                </strong>
                <span className="text-slate-600">{item.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">
          Kenapa perlu Cross-Validation?
        </h4>
        <p className="text-sm text-slate-600">
          Nilai K itu penting. Kalau K terlalu kecil (misal 1), model gampang
          kena noise. Kalau K terlalu besar, justru data yang sebenernya beda
          kelas jadi keangkut. Makanya kita pakai 5-Fold Cross-Validation buat
          cari K paling optimal — diuji dari K=1 sampai K=15, yang paling bagus
          F1-Score-nya, itulah yang dipakai.
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">
          Normalisasi: Kenapa Penting?
        </h4>
        <p className="text-sm text-slate-600">
          Bayangin kalau ada fitur "Usia" (21-62) dan "Jenis Kelamin" (0-1).
          Tanpa normalisasi, Usia bakal mendominasi perhitungan jarak karena
          angkanya jauh lebih gede. Solusinya? Pakai Min-Max Normalization biar
          semua fitur punya range yang sama (0 sampai 1).
        </p>
      </div>
    </div>
  );
}

function PreprocessingContent() {
  return (
    <div className="space-y-6 text-slate-600 leading-relaxed font-light">
      <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
        <p className="text-sm sm:text-base text-amber-900 m-0 leading-relaxed">
          <strong>Sebelum masuk ke tahapan:</strong> Data awal dari jurnal itu
          2.205 pasien VCT. Kita pake 200 data sintetis yang dibuat berdasarkan
          distribusi pola data asli, dengan 13 fitur input lengkap. Biar nggak
          ada privasi yang dilanggar, tapi tetap representatif.
        </p>
      </div>

      <p className="text-base sm:text-lg">
        Ada <strong>5 tahap preprocessing</strong> yang harus dijalankan sebelum
        data masuk ke KNN. Setiap tahap penting dan punya alasan tersendiri:
      </p>

      {/* Tahap 1: Data Cleaning */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold font-mono">
            1
          </div>
          <h5 className="font-bold text-slate-900 text-lg">Data Cleaning</h5>
        </div>
        <p className="text-slate-600 font-light text-sm leading-relaxed mb-3">
          Yang ini gampang: kalau ada baris yang ada data kosong (null),
          langsung buang aja seluruh barisnya. Di data kita, ada 2 baris yang
          kosong di kolom "Kelompok Populasi".
        </p>
        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
          <p>
            <strong>Input:</strong> 200 baris data mentah (masih string, ada
            null) — 13 fitur + 1 target
          </p>
          <p>
            <strong>Proses:</strong> Hapus baris yang ada null → baris bersih
          </p>
          <p>
            <strong>Output:</strong> Data tanpa missing value, siap di-encode
          </p>
        </div>
        <p className="text-xs text-slate-500 italic mt-2">
          Kenapa harus dibuang? Karena KNN nggak bisa ngitung jarak kalau salah
          satu fiturnya kosong. Sama kayak jurnalnya: "kolom Kelompok Populasi
          memiliki 5 data yang hilang."
        </p>
      </div>

      {/* Tahap 2: LabelEncoder */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold font-mono">
            2
          </div>
          <h5 className="font-bold text-slate-900 text-lg">LabelEncoder</h5>
        </div>
        <p className="text-slate-600 font-light text-sm leading-relaxed mb-3">
          Nah ini yang agak tricky. Kita punya data kayak "Laki-laki",
          "Perempuan", "LSL", "Pengguna Napza" — semuanya teks. Tapi KNN butuh
          angka. Jadi kita ubah tiap teks jadi angka berurutan berdasarkan
          urutan alfabet.
        </p>
        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
          <p>
            <strong>Input:</strong> Data bersih, masih dalam bentuk teks (13
            fitur)
          </p>
          <p>
            <strong>Proses:</strong> Kumpulkan nilai unik per kolom → urutkan
            A-Z → kasih angka 0, 1, 2, dst
          </p>
          <p>
            <strong>Output:</strong> 13 fitur + 1 target = 14 kolom numerik
            (siap dihitung jaraknya)
          </p>
        </div>
        <p className="text-xs text-slate-500 italic mt-2">
          Contoh: "Laki-laki" jadi 0, "Perempuan" jadi 1 (karena L di depan P).
          "LSL" jadi 0, "Pengguna Napza" jadi 1, dst. Sesuai jurnal:
          "LabelEncoder berfungsi untuk mengubah setiap nilai dalam kolom
          menjadi angka berurutan."
        </p>
      </div>

      {/* Tahap 3: Splitting */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 font-bold font-mono">
            3
          </div>
          <h5 className="font-bold text-slate-900 text-lg">
            Splitting Data (80/20)
          </h5>
        </div>
        <p className="text-slate-600 font-light text-sm leading-relaxed mb-3">
          Setelah semua jadi angka, data dibagi: 80% buat latihan (training),
          20% buat tes (testing). Sebelum dibagi, data diacak dulu pakai
          Fisher-Yates shuffle biar nggak berurut.
        </p>
        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
          <p>
            <strong>Input:</strong> Data ter-encode (14 kolom: 13 fitur + 1
            target)
          </p>
          <p>
            <strong>Proses:</strong> Acak data → bagi 80% training, 20% testing
          </p>
          <p>
            <strong>Output:</strong> Training untuk melatih KNN, Testing untuk
            mengevaluasi
          </p>
        </div>
        <p className="text-xs text-slate-500 italic mt-2">
          Kenapa harus dipisah? Kalau data testing dipake saat training, model
          cuma "menghafal" jawabannya. Hasilnya kelihatan bagus tapi sebenernya
          nggak akurat — ini yang disebut data leakage. Seed=42 dipake biar tiap
          kali dijalankan, hasilnya sama.
        </p>
      </div>

      {/* Tahap 4: SMOTE */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold font-mono">
            4
          </div>
          <h5 className="font-bold text-slate-900 text-lg">
            SMOTE (Seimbangkan Kelas)
          </h5>
        </div>
        <p className="text-slate-600 font-light text-sm leading-relaxed mb-3">
          Di data kita, kelas "Belum Tahu" cuma punya 1-2 data. Kalau dibiarkan,
          KNN bakal lebih sering nebak kelas mayoritas karena jumlahnya lebih
          banyak. SMOTE bikin data sintetis buat kelas yang kurang — tapi bukan
          duplikat, melainkan interpolasi antara data yang ada.
        </p>
        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
          <p>
            <strong>Input:</strong> Data training yang kelasnya timpang
          </p>
          <p>
            <strong>Proses:</strong> Untuk kelas minoritas → cari tetangga →
            bikin data baru di antara mereka
          </p>
          <p>
            <strong>Output:</strong> Data training seimbang, semua kelas
            jumlahnya sama
          </p>
        </div>
        <p className="text-xs text-slate-500 italic mt-2">
          Rumus SMOTE: x_sintetis = x_i + random(0,1) × (x_nn - x_i). Artinya,
          data baru ditaruh di jalur antara data asli dan tetangganya. Sesuai
          jurnal: "SMOTETomek sebagai metode resampling untuk mengatasi
          ketidakseimbangan kelas."
        </p>
      </div>

      {/* Tahap 5: Normalisasi */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold font-mono">
            5
          </div>
          <h5 className="font-bold text-slate-900 text-lg">
            Normalisasi (Min-Max)
          </h5>
        </div>
        <p className="text-slate-600 font-light text-sm leading-relaxed mb-3">
          Tahap terakhir. Semua fitur dikompres ke range 0-1 supaya punya bobot
          yang adil. Rumusnya: (nilai - min) / (max - min). Kalau nilai = min →
          hasilnya 0. Kalau nilai = max → hasilnya 1.
        </p>
        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
          <p>
            <strong>Input:</strong> Data training seimbang dengan nilai asli
          </p>
          <p>
            <strong>Proses:</strong> Hitung min/max tiap fitur → terapkan rumus
            ke semua data
          </p>
          <p>
            <strong>Output:</strong> Semua fitur bernilai antara 0 dan 1
          </p>
        </div>
        <p className="text-xs text-slate-500 italic mt-2">
          Contoh: Usia 21-62 tanpa normalisasi bakal mendominasi jarak Euclidean
          dibanding fitur biner 0-1. Min-Max bikin semua 13 fitur setara. Saya
          bahas lebih detail di tab "Evaluasi Model" — ada contoh
          perhitungannya.
        </p>
      </div>
    </div>
  );
}

function PerformaContent() {
  // Hitung metrik aktual dari data
  const metrics = useMemo(() => {
    try {
      const encoded = runFullPreprocessing(rawDataset).encodedBeforeSmote;
      return evaluateModel(encoded, 3, 42);
    } catch {
      return null;
    }
  }, []);

  if (!metrics) {
    return (
      <p className="text-sm text-slate-500">Gagal memuat metrik performa.</p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
        Berikut hasil evaluasi model KNN dengan K=3 dan 5-Fold Cross-Validation.
        Angka ini dihitung langsung dari data, bukan angka asal.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        {[
          { label: "Akurasi", value: metrics.accuracy },
          { label: "Precision", value: metrics.macroPrecision },
          { label: "Recall", value: metrics.macroRecall },
          { label: "F1-Score", value: metrics.macroF1Score },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 ${
              idx === 0
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-1 ring-slate-800"
                : "bg-white border border-slate-200 text-slate-800 shadow-sm"
            }`}
          >
            <div
              className={`text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight ${idx === 0 ? "text-white" : "text-slate-900"}`}
            >
              {(stat.value * 100).toFixed(1)}%
            </div>
            <div
              className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${idx === 0 ? "text-slate-400" : "text-slate-500"}`}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-50/50 p-6 sm:p-8 rounded-2xl border border-emerald-100 relative overflow-hidden flex gap-4 items-start sm:items-center">
        <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0 opacity-80" />
        <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-2">
          <p>
            Recall di angka{" "}
            <strong>{(metrics.macroRecall * 100).toFixed(1)}%</strong> artinya
            dari semua pasien yang memang ODHIV, hampir semuanya berhasil
            dikenali oleh sistem. Ini penting banget — karena kalau ada ODHIV
            yang nggak terdeteksi (false negative), dampaknya fatal.
          </p>
          <p>
            Precision di{" "}
            <strong>{(metrics.macroPrecision * 100).toFixed(1)}%</strong>{" "}
            berarti dari yang diprediksi positif, mayoritas memang benar
            positif. Jadi false alarm-nya rendah.
          </p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">
        <strong className="text-slate-900">Yang perlu dicatat:</strong>{" "}
        Angka-angka ini dari data 200 record sintetis dengan 13 fitur. Di data
        asli 2.205 pasien, performanya bisa beda — tapi prinsip kerjanya tetap
        sama. Di tab "Evaluasi Model" kamu bisa ganti nilai K dan lihat sendiri
        gimana pengaruhnya ke metrik.
      </div>
    </div>
  );
}

function ReferensiContent() {
  const features = [
    {
      name: "Umur",
      desc: "Usia pasien waktu datang ke poli. Rentang produktif (15-60 tahunan) biasanya lebih relevan buat risiko HIV.",
      type: "Numerik",
    },
    {
      name: "Jenis Kelamin",
      desc: "Laki-laki atau Perempuan. Di encode jadi angka berdasarkan urutan alfabet.",
      type: "Kategorikal",
    },
    {
      name: "Kelompok Populasi",
      desc: "Golongan berisiko: Umum, Waria, ODHA, Ibu Hamil, atau WBP. Fitur ini punya korelasi kuat sama status ODHIV.",
      type: "Kategorikal",
    },
    {
      name: "Alasan Kunjungan",
      desc: "Kenapa pasien datang: Konseling, Tes sukarela, Kontak serumah, Rujukan klinis, IMS, atau Ibu hamil.",
      type: "Kategorikal",
    },
    {
      name: "Riwayat Tes HIV",
      desc: "Apakah pasien pernah melakukan tes HIV sebelumnya: Belum pernah, Pernah (negatif), atau Pernah (positif).",
      type: "Kategorikal",
    },
    {
      name: "Riwayat IMS",
      desc: "Riwayat Infeksi Menular Seksual: Tidak ada, Pernah, atau Sedang terjadi. IMS meningkatkan risiko penularan HIV.",
      type: "Kategorikal",
    },
    {
      name: "Jumlah Pasangan Seksual",
      desc: "Jumlah pasangan seksual dalam setahun terakhir. Semakin banyak, semakin tinggi risiko paparan.",
      type: "Numerik",
    },
    {
      name: "Penggunaan Kondom",
      desc: "Apakah pasien rutin menggunakan kondom: Ya atau Tidak. Penggunaan konsisten menurunkan risiko.",
      type: "Biner",
    },
    {
      name: "Penggunaan NAPZA Suntik",
      desc: "Apakah pasien menggunakan narkotika dengan jarum suntik: Ya atau Tidak. Risiko tinggi melalui darah.",
      type: "Biner",
    },
    {
      name: "Status Pernikahan",
      desc: "Status pernikahan pasien: Belum Kawin, Kawin, atau Cerai. Bisa jadi indikator pola perilaku.",
      type: "Kategorikal",
    },
    {
      name: "Usia Pertama Hubungan",
      desc: "Usia saat pertama kali melakukan hubungan seksual. Usia muda = risiko lebih tinggi karena organ belum matang.",
      type: "Numerik",
    },
    {
      name: "Terapi ARV",
      desc: "Apakah pasien sedang menjalani terapi Antiretroviral: Ya atau Tidak. ARV menunjukkan status HIV positif.",
      type: "Biner",
    },
    {
      name: "Gejala Klinis",
      desc: "Tingkat gejala yang dialami: Tidak ada gejala, Gejala ringan, Gejala sedang, atau Gejala berat.",
      type: "Kategorikal",
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <p className="text-slate-600 leading-relaxed font-light text-base sm:text-lg">
        Ini 13 fitur yang dipakai oleh sistem. Tiap fitur punya peran
        masing-masing dalam prediksi risiko HIV. Fitur dipilih berdasarkan
        relevansi klinis dengan penularan HIV.
      </p>

      <div className="bg-white border border-slate-200 rounded-2xl w-full shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50">
                  #
                </th>
                <th className="py-4 px-6 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50">
                  Fitur
                </th>
                <th className="py-4 px-6 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Penjelasan
                </th>
                <th className="py-4 px-6 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                  Tipe
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {features.map((f, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-4 px-6 font-mono text-slate-400 text-xs bg-white">
                    {idx + 1}
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap align-top bg-white">
                    {f.name}
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-light leading-relaxed text-sm">
                    {f.desc}
                  </td>
                  <td className="py-4 px-6 align-top text-right">
                    <span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium whitespace-nowrap">
                      {f.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">
        <strong className="text-slate-900">Target prediksi:</strong> Status
        ODHIV dengan 3 kelas — (0) Bukan ODHIV, (1) ODHIV, (2) Belum Tahu. Semua
        13 fitur di atas diproses lewat pipeline preprocessing sebelum masuk ke
        KNN.
      </div>
    </div>
  );
}

function KodeContent() {
  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      <div className="bg-indigo-50 text-indigo-900 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="p-3 bg-white rounded-xl shadow-sm shrink-0">
          <Code className="w-6 h-6 text-indigo-600" />
        </div>
        <p className="text-sm sm:text-base leading-relaxed font-light m-0">
          Semua kode di sini berjalan di browser (client-side). Nggak ada
          server, nggak ada data yang dikirim ke mana-mana. Prediksi langsung di
          laptop/HP kamu. Privasi aman.
        </p>
      </div>

      {/* Struktur File */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-b border-slate-200">
          <h5 className="font-semibold text-slate-700 text-sm">
            Struktur File Utama
          </h5>
        </div>
        <div className="p-5 sm:p-6 text-sm font-mono text-slate-600 space-y-1">
          <div>src/</div>
          <div className="pl-4">├── components/</div>
          <div className="pl-8 text-slate-500">
            ├── Predictor.tsx{" "}
            <span className="text-xs text-slate-400">
              (multi-step wizard, 13 fitur)
            </span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── Dashboard.tsx{" "}
            <span className="text-xs text-slate-400">(admin dashboard)</span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── PatientList.tsx{" "}
            <span className="text-xs text-slate-400">(CRUD pasien)</span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── PatientHistory.tsx{" "}
            <span className="text-xs text-slate-400">
              (riwayat prediksi pasien)
            </span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── AdminUsers.tsx{" "}
            <span className="text-xs text-slate-400">(kelola role user)</span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── ModelEvaluation.tsx{" "}
            <span className="text-xs text-slate-400">
              (pipeline + evaluasi)
            </span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── Documentation.tsx{" "}
            <span className="text-xs text-slate-400">(halaman ini)</span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── LoginPage.tsx{" "}
            <span className="text-xs text-slate-400">
              (email + Google auth)
            </span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── ProtectedRoute.tsx{" "}
            <span className="text-xs text-slate-400">(role-based guard)</span>
          </div>
          <div className="pl-8 text-slate-500">
            └── About.tsx{" "}
            <span className="text-xs text-slate-400">(info kelompok)</span>
          </div>
          <div className="pl-4">├── contexts/</div>
          <div className="pl-8 text-slate-500">
            └── AuthContext.tsx{" "}
            <span className="text-xs text-slate-400">(auth + role system)</span>
          </div>
          <div className="pl-4">├── ml/</div>
          <div className="pl-8 text-slate-500">
            └── runner.ts{" "}
            <span className="text-xs text-slate-400">
              (real-time KNN prediction)
            </span>
          </div>
          <div className="pl-4">
            ├── utils/{" "}
            <span className="text-xs text-slate-400">
              (semua algoritma dari scratch!)
            </span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── knn.ts{" "}
            <span className="text-xs text-slate-400">(KNN + voting)</span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── distance.ts{" "}
            <span className="text-xs text-slate-400">(Euclidean Distance)</span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── normalization.ts{" "}
            <span className="text-xs text-slate-400">(Min-Max, 13 fitur)</span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── splitting.ts{" "}
            <span className="text-xs text-slate-400">(train/test split)</span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── evaluation.ts{" "}
            <span className="text-xs text-slate-400">
              (confusion matrix + metrics)
            </span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── validation.ts{" "}
            <span className="text-xs text-slate-400">
              (K-Fold CV + optimasi K)
            </span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── sMOTE.ts{" "}
            <span className="text-xs text-slate-400">(SMOTE oversampling)</span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── correlation.ts{" "}
            <span className="text-xs text-slate-400">
              (Pearson Correlation)
            </span>
          </div>
          <div className="pl-8 text-slate-500">
            └── preprocessing.ts{" "}
            <span className="text-xs text-slate-400">(pipeline 5 tahap)</span>
          </div>
          <div className="pl-4">├── lib/</div>
          <div className="pl-8 text-slate-500">
            ├── firestore.ts{" "}
            <span className="text-xs text-slate-400">
              (CRUD + role management)
            </span>
          </div>
          <div className="pl-8 text-slate-500">
            ├── seedData.ts{" "}
            <span className="text-xs text-slate-400">
              (21 seed records, 13 fitur)
            </span>
          </div>
          <div className="pl-8 text-slate-500">
            └── exportCSV.ts{" "}
            <span className="text-xs text-slate-400">(export ke CSV)</span>
          </div>
          <div className="pl-4">└── data/</div>
          <div className="pl-8 text-slate-500">
            └── raw_hiv_dataset.json{" "}
            <span className="text-xs text-slate-400">
              (200 data, 13 fitur + target)
            </span>
          </div>
        </div>
      </div>

      {/* Contoh Kode */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center gap-4">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <h5 className="font-semibold text-slate-700 text-xs sm:text-sm font-mono border-l border-slate-300 pl-4">
            src/utils/distance.ts
          </h5>
        </div>
        <div className="bg-slate-900 overflow-hidden">
          <div className="p-5 sm:p-6 text-slate-300 text-[12px] sm:text-[13px] font-mono leading-loose tabular-nums overflow-x-auto">
            <div className="whitespace-pre">
              <span className="text-slate-500 italic">
                // Euclidean Distance dari scratch
              </span>
            </div>
            <div className="whitespace-pre">
              <span className="text-pink-400">export function</span>{" "}
              <span className="text-blue-400">euclideanDistance</span>(a:{" "}
              <span className="text-teal-300">number</span>[], b:{" "}
              <span className="text-teal-300">number</span>[]):{" "}
              <span className="text-teal-300">number</span> {"{"}
            </div>
            <div className="whitespace-pre">
              {" "}
              <span className="text-pink-400">let</span> sum ={" "}
              <span className="text-orange-300">0</span>;
            </div>
            <div className="whitespace-pre">
              {" "}
              <span className="text-pink-400">for</span> (
              <span className="text-pink-400">let</span> i ={" "}
              <span className="text-orange-300">0</span>; i {"<"} a.length; i++){" "}
              {"{"}
            </div>
            <div className="whitespace-pre">
              {" "}
              sum += (a[i] - b[i]) ** <span className="text-orange-300">2</span>
              ;
            </div>
            <div className="whitespace-pre"> {"}"}</div>
            <div className="whitespace-pre">
              {" "}
              <span className="text-pink-400">return</span> Math.
              <span className="text-blue-400">sqrt</span>(sum);
            </div>
            <div className="whitespace-pre">{"}"}</div>
          </div>
          <div className="bg-slate-800/80 p-4 sm:p-5 border-t border-slate-700/50 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            <strong className="font-semibold text-white">Rumus:</strong> d(p,q)
            = √Σ(pᵢ - qᵢ)² — mengukur seberapa jauh titik p dari titik q di
            ruang multi-dimensi.
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center gap-4">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <h5 className="font-semibold text-slate-700 text-xs sm:text-sm font-mono border-l border-slate-300 pl-4">
            src/utils/knn.ts
          </h5>
        </div>
        <div className="bg-slate-900 p-5 sm:p-6 overflow-x-auto">
          <div className="text-[12px] sm:text-[13px] font-mono leading-loose overflow-hidden tabular-nums">
            <div className="text-slate-500 italic whitespace-pre">
              // KNN Prediksi dengan Majority Voting
            </div>
            <div className="whitespace-pre">
              <span className="text-pink-400">export function</span>{" "}
              <span className="text-blue-400">knnPredict</span>(
            </div>
            <div className="whitespace-pre">
              {" "}
              trainX: <span className="text-teal-300">number</span>[][], trainY:{" "}
              <span className="text-teal-300">number</span>[],
            </div>
            <div className="whitespace-pre">
              {" "}
              testPoint: <span className="text-teal-300">number</span>[], k:{" "}
              <span className="text-teal-300">number</span>
            </div>
            <div className="whitespace-pre">
              ): <span className="text-teal-300">number</span> {"{"}
            </div>
            <div className="whitespace-pre">
              {" "}
              <span className="text-slate-500 italic">
                {"// 1. Hitung jarak ke semua data latih"}
              </span>
            </div>
            <div className="whitespace-pre">
              {" "}
              <span className="text-pink-400">const</span> distances = trainX.
              <span className="text-blue-400">map</span>((row, i) =&gt; ({"{"}
            </div>
            <div className="whitespace-pre"> label: trainY[i],</div>
            <div className="whitespace-pre">
              {" "}
              distance: <span className="text-blue-400">euclideanDistance</span>
              (testPoint, row)
            </div>
            <div className="whitespace-pre"> {"}"}));</div>
            <br />
            <div className="whitespace-pre">
              {" "}
              <span className="text-slate-500 italic">
                {"// 2. Ambil K tetangga terdekat"}
              </span>
            </div>
            <div className="whitespace-pre">
              {" "}
              distances.<span className="text-blue-400">sort</span>((a, b) =&gt;
              a.distance - b.distance);
            </div>
            <div className="whitespace-pre">
              {" "}
              <span className="text-pink-400">const</span> neighbors =
              distances.<span className="text-blue-400">slice</span>(
              <span className="text-orange-300">0</span>, k);
            </div>
            <br />
            <div className="whitespace-pre">
              {" "}
              <span className="text-slate-500 italic">
                {"// 3. Voting mayoritas"}
              </span>
            </div>
            <div className="whitespace-pre">
              {" "}
              <span className="text-pink-400">const</span> votes:{" "}
              <span className="text-teal-300">Record</span>&lt;
              <span className="text-teal-300">number</span>,{" "}
              <span className="text-teal-300">number</span>&gt; = {"{}"};
            </div>
            <div className="whitespace-pre">
              {" "}
              neighbors.<span className="text-blue-400">forEach</span>(n =&gt;
              votes[n.label] = (votes[n.label] ||{" "}
              <span className="text-orange-300">0</span>) +{" "}
              <span className="text-orange-300">1</span>);
            </div>
            <div className="whitespace-pre">
              {" "}
              <span className="text-pink-400">return</span>{" "}
              <span className="text-blue-400">parseInt</span>(Object.
              <span className="text-blue-400">entries</span>(votes).
              <span className="text-blue-400">sort</span>((a, b) =&gt; b[
              <span className="text-orange-300">1</span>] - a[
              <span className="text-orange-300">1</span>])[
              <span className="text-orange-300">0</span>][
              <span className="text-orange-300">0</span>]);
            </div>
            <div className="whitespace-pre">{"}"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
