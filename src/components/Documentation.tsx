import React, { useState } from 'react';
import { BookOpen, Activity, GitCommit, ShieldCheck, Database, Layers, Code, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const SECTIONS = [
  { id: 'pengantar', label: 'Pengantar', icon: Activity, title: 'Pengantar Sistem' },
  { id: 'arsitektur', label: 'Arsitektur', icon: GitCommit, title: 'Arsitektur Algoritma' },
  { id: 'preprocessing', label: 'Prapemrosesan', icon: Layers, title: 'Prapemrosesan Data' },
  { id: 'performa', label: 'Performa', icon: ShieldCheck, title: 'Metrik & Validasi' },
  { id: 'referensi', label: 'Referensi', icon: Database, title: 'Referensi Klinis' },
  { id: 'kode', label: 'Kode program', icon: Code, title: 'Struktur Kode' },
];

export default function Documentation() {
  const [activeSectionId, setActiveSectionId] = useState('pengantar');

  const currentIndex = SECTIONS.findIndex((s) => s.id === activeSectionId);
  const activeSection = SECTIONS[currentIndex];

  const handleNext = () => {
    if (currentIndex < SECTIONS.length - 1) setActiveSectionId(SECTIONS[currentIndex + 1].id);
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
             <span className="text-sm font-bold uppercase tracking-wider text-slate-800">Dokumentasi</span>
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
                    ? 'bg-white shadow-md border border-slate-200 text-slate-900 font-bold scale-100'
                    : isCompleted
                      ? 'bg-slate-100/50 text-slate-600 hover:bg-white hover:shadow-sm border border-transparent scale-95 md:scale-100'
                      : 'bg-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-700 border border-transparent scale-95 md:scale-100'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-slate-800' : isCompleted ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className="text-sm tracking-tight whitespace-nowrap flex-1">{item.label}</span>
                {isCompleted && !isActive && <CheckCircle className="w-4 h-4 text-emerald-500 hidden md:block shrink-0" />}
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
               <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">{activeSection.title}</h2>
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full" key={activeSectionId}>
               {activeSectionId === 'pengantar' && <PengantarContent />}
               {activeSectionId === 'arsitektur' && <ArsitekturContent />}
               {activeSectionId === 'preprocessing' && <PreprocessingContent />}
               {activeSectionId === 'performa' && <PerformaContent />}
               {activeSectionId === 'referensi' && <ReferensiContent />}
               {activeSectionId === 'kode' && <KodeContent />}
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
                ? 'text-slate-300 cursor-not-allowed opacity-50' 
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>
          
          <div className="flex gap-1.5 sm:gap-2">
            {SECTIONS.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-slate-800 w-4 sm:w-6' : idx < currentIndex ? 'bg-slate-400 w-1.5 sm:w-2' : 'bg-slate-200 w-1.5 sm:w-2'}`} 
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === SECTIONS.length - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              currentIndex === SECTIONS.length - 1
                ? 'opacity-0 pointer-events-none'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-95'
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
// Content Components
// ----------------------------------------

function PengantarContent() {
  return (
    <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-light leading-relaxed">
      <p className="mb-8 text-base sm:text-lg">
        Penyakit HIV/AIDS merupakan masalah kesehatan global yang kritis. Perkembangan teknologi sistem informasi, khususnya rekayasa sistem berbasis pengetahuan (Knowledge-Based Systems) memiliki andil signifikan terhadap perancangan sistem penunjang keputusan klinis.
      </p>
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <h4 className="text-slate-900 font-bold mb-4 flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-slate-500" /> Visi & Objektif
        </h4>
        <p className="text-sm sm:text-base m-0 leading-relaxed text-slate-600">
          Sistem prediksi ini dirancang menggunakan algoritma <strong className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">K-Nearest Neighbor (KNN)</strong>. Objek penelitian dan basis data bersumber dari data kunjungan poli <em>Voluntary Counselling and Testing</em> (VCT) yang menganalisis distribusi tingkat risiko berdasarkan variabel demografi dan riwayat medis pengunjung. Pemanfaatan sistem ini ditujukan bagi tenaga medis guna mengoptimalkan proses klasifikasi, identifikasi, serta penetapan keputusan klinis pada unit VCT dan instalasi terkait.
        </p>
      </div>
    </div>
  );
}

function ArsitekturContent() {
  return (
    <div className="text-slate-600 font-light leading-relaxed space-y-8 w-full max-w-full">
      <p className="text-base sm:text-lg">
        Algoritma <em>K-Nearest Neighbor</em> (KNN) merupakan paradigma <em>Supervised Learning</em> yang mengklasifikasikan sampel data baru berdasarkan mayoritas kelas dari K tetangga terdekat di ruang dimensi fitur metrik. Model memetakan korelasi variabel dengan cara menghitung jarak kedudukan profil pasien baru terhadap riwayat rekam medis pasien di masa lalu.
      </p>
      
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-800"></span>
          Desain Optimasi Parameter
        </h4>
        <ul className="space-y-6 m-0 p-0 text-sm sm:text-base list-none">
          {[
            { title: 'Cross-Validation', desc: 'Penyelarasan parameter klasifikasi divalidasi silang guna meminimalisasi bias sampel tak terkontrol.' },
            { title: 'Standarisasi Jarak', desc: 'Penerapan limitasi jarak (Distance Metrics) dengan skala Min-Max untuk menyeimbangkan disparitas numerik (Misal: perbandingan Usia vs Boolean).' },
            { title: 'Iterasi Parameter', desc: 'Parameterisasi optimal diiterasi berdasarkan validasi nilai parameter K dengan presisi kalkulasi hingga skala ketepatan 97.96%.' }
          ].map((item, idx) => (
            <li key={idx} className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                {idx + 1}
              </div>
              <div className="flex-1">
                <strong className="text-slate-900 font-semibold block mb-1">{item.title}</strong>
                <span className="text-slate-600">{item.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PreprocessingContent() {
  return (
    <div className="text-slate-600 leading-relaxed font-light space-y-8">
      <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
        <p className="text-sm sm:text-base text-amber-900 m-0 leading-relaxed">
          <strong>Klarifikasi Basis Data:</strong> Berdasarkan jurnal rujukan, data awal penelitian berasal dari unit <em>Voluntary Counselling and Testing (VCT) RSUD Dr. Chasbullah Abdul Madjid Kota Bekasi</em> dengan total <strong>2.205 sampel</strong> rekam medis (pasien). Pada purwarupa sistem ini, kami mengimplementasikan sebagian sampel representatif (data tiruan berdasarkan pola asli) untuk mendemonstrasikan algoritma tanpa melanggar privasi medis pasien secara aktual.
        </p>
      </div>
      
      <p className="text-base sm:text-lg">
        Sistem menerapkan <strong>5 tahap preprocessing</strong> sesuai metodologi jurnal (hal. 128-130). Setiap tahap memiliki input, proses, dan output yang jelas:
      </p>
      
      {/* Tahap 1: Data Cleaning */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold font-mono">1</div>
          <h5 className="font-bold text-slate-900 text-lg">Data Cleaning</h5>
        </div>
        <p className="text-slate-600 font-light text-sm leading-relaxed mb-3">
          <strong>Input:</strong> Dataset mentah (23 baris) dengan nilai null pada kolom tertentu.<br/>
          <strong>Proses:</strong> Periksa setiap baris — jika ADA field yang null, HAPUS seluruh baris.<br/>
          <strong>Output:</strong> Dataset bersih (21 baris) tanpa missing value.
        </p>
        <p className="text-xs text-slate-500 italic">
          Mengapa: KNN tidak bisa menghitung jarak jika ada fitur yang tidak diketahui. Sama dengan jurnal: "kolom Kelompok Populasi memiliki 5 data yang hilang (null)."
        </p>
      </div>

      {/* Tahap 2: LabelEncoder */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold font-mono">2</div>
          <h5 className="font-bold text-slate-900 text-lg">LabelEncoder</h5>
        </div>
        <p className="text-slate-600 font-light text-sm leading-relaxed mb-3">
          <strong>Input:</strong> Dataset bersih dengan nilai STRING (kategorikal).<br/>
          <strong>Proses:</strong> Kumpulkan nilai unik per kolom → urutkan alphabetically → assign angka berurutan.<br/>
          <strong>Output:</strong> Dataset ter-encode dengan angka.
        </p>
        <p className="text-xs text-slate-500 italic">
          Mengapa: Euclidean Distance tidak bisa menghitung jarak antara string "Laki-laki" dan "Perempuan". Jurnal: "LabelEncoder berfungsi untuk mengubah setiap nilai dalam kolom menjadi angka berurutan."
        </p>
      </div>

      {/* Tahap 3: Splitting */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 font-bold font-mono">3</div>
          <h5 className="font-bold text-slate-900 text-lg">Splitting Data (80/20)</h5>
        </div>
        <p className="text-slate-600 font-light text-sm leading-relaxed mb-3">
          <strong>Input:</strong> Seluruh data ter-encode.<br/>
          <strong>Proses:</strong> Fisher-Yates shuffle (seed=42) → 80% training, 20% testing.<br/>
          <strong>Output:</strong> Data training (untuk melatih KNN) dan data testing (untuk mengevaluasi).
        </p>
        <p className="text-xs text-slate-500 italic">
          Mengapa: Data testing tidak boleh digunakan saat training — jika iya, model "menghafal" dan akurasinya palsu (data leakage). Jurnal: "20% testing, 80% training."
        </p>
      </div>

      {/* Tahap 4: SMOTE */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold font-mono">4</div>
          <h5 className="font-bold text-slate-900 text-lg">SMOTE (Penanganan Imbalance)</h5>
        </div>
        <p className="text-slate-600 font-light text-sm leading-relaxed mb-3">
          <strong>Input:</strong> Data training dengan distribusi kelas tidak seimbang.<br/>
          <strong>Proses:</strong> Untuk kelas minoritas → cari K tetangga → interpolasi linear → generate sampel sintetis.<br/>
          <strong>Output:</strong> Data training seimbang (semua kelas jumlahnya sama).
        </p>
        <p className="text-xs text-slate-500 italic">
          Mengapa: Tanpa SMOTE, KNN akan bias ke kelas mayoritas. Jurnal: "SMOTETomek sebagai metode resampling untuk mengatasi ketidakseimbangan kelas."
        </p>
      </div>

      {/* Tahap 5: Normalisasi */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold font-mono">5</div>
          <h5 className="font-bold text-slate-900 text-lg">Normalisasi (Min-Max)</h5>
        </div>
        <p className="text-slate-600 font-light text-sm leading-relaxed mb-3">
          <strong>Input:</strong> Data dengan nilai asli (umur 21-62, jenis kelamin 0-1, dll).<br/>
          <strong>Proses:</strong> Hitung min/max per fitur → terapkan rumus (x - min) / (max - min).<br/>
          <strong>Output:</strong> Semua fitur bernilai antara 0 dan 1.
        </p>
        <p className="text-xs text-slate-500 italic">
          Mengapa: Tanpa normalisasi, umur (21-62) mendominasi jarak Euclidean dibanding jenis kelamin (0-1). Min-Max memastikan semua fitur punya bobot adil.
        </p>
      </div>
    </div>
  );
}

function PerformaContent() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        {[
          { label: 'Akurasi', value: '97.9%', type: 'primary' },
          { label: 'Presisi', value: '78.6%', type: 'secondary' },
          { label: 'Recall', value: '98.8%', type: 'secondary' },
          { label: 'F1-Score', value: '84.4%', type: 'secondary' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 ${
            stat.type === 'primary' 
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-1 ring-slate-800' 
              : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <div className={`text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight ${stat.type === 'primary' ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
            <div className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${stat.type === 'primary' ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
          </div>
        ))}
      </div>
      
      <div className="bg-emerald-50/50 p-6 sm:p-8 rounded-2xl border border-emerald-100 relative overflow-hidden flex gap-4 items-start sm:items-center">
        <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0 opacity-80" />
        <p className="text-slate-700 font-light leading-relaxed text-sm sm:text-base m-0">
          Rasio <strong className="font-semibold text-slate-900">recall</strong> yang nyaris sempurna (98.88%) mengindikasikan model memiliki kapabilitas sangat presisi dalam mengidentifikasi instansi kondisi ODHIV. Rasio kesalahan <em className="text-slate-900 font-medium bg-white/50 px-1 rounded">false-negative</em> dapat ditekan hingga margin minimal untuk menghindari resiko fatal kesalahan diagnosis. Toleransi error klasifikasi ini hanya berada di ambang ±2%.
        </p>
      </div>
    </div>
  );
}

function ReferensiContent() {
  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <p className="text-slate-600 leading-relaxed font-light text-base sm:text-lg">
        Variabel analisis korelatif yang membangun landasan metrik kalkulasi pada model klasifikasi:
      </p>
      
      <div className="bg-white border border-slate-200 rounded-2xl w-full shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50">Atribut / Fitur</th>
                <th className="py-4 px-6 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Keterangan Diagnostik</th>
                <th className="py-4 px-6 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Tipe Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-5 px-6 font-semibold text-slate-900 whitespace-nowrap align-top bg-white">Umur</td>
                <td className="py-5 px-6 text-slate-600 font-light leading-relaxed text-sm">Batas usia rentang produktif pasien saat kunjungan poli berlangsung.</td>
                <td className="py-5 px-6 align-top text-right"><span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium whitespace-nowrap">Integer</span></td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-5 px-6 font-semibold text-slate-900 whitespace-nowrap align-top bg-white">Jenis Kelamin</td>
                <td className="py-5 px-6 text-slate-600 font-light leading-relaxed text-sm">Demografi gender biologis (Laki-laki = 1, Perempuan = 0).</td>
                <td className="py-5 px-6 align-top text-right"><span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium whitespace-nowrap">Ordinal</span></td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-5 px-6 font-semibold text-slate-900 whitespace-nowrap align-top bg-white">Alasan Kunjungan</td>
                <td className="py-5 px-6 text-slate-600 font-light leading-relaxed text-sm">Motif klinis utama seperti Pemeriksaan, Konsultasi, atau Rujukan PDP. Memiliki korelasi linear tertinggi (-0.86 Pearson r).</td>
                <td className="py-5 px-6 align-top text-right"><span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium whitespace-nowrap">Ordinal</span></td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-5 px-6 font-semibold text-slate-900 whitespace-nowrap align-top bg-white">Kelompok Populasi</td>
                <td className="py-5 px-6 text-slate-600 font-light leading-relaxed text-sm">Karakteristik riwayat sosial yang membentuk profil berisiko (LSL, Pengguna Napza, Waria, Pekerja Seks, dll).</td>
                <td className="py-5 px-6 align-top text-right"><span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium whitespace-nowrap">Ordinal</span></td>
              </tr>
            </tbody>
          </table>
        </div>
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
          Aplikasi ini murni menggunakan arsitektur <strong className="font-semibold text-indigo-950">Client-Side Machine Learning</strong> via React.js. Komputasi prediksi dieksekusi secara instan di peramban pengguna sehingga privasi medis terjamin penuh.
        </p>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex gap-1.5 shrink-0">
               <div className="w-3 h-3 rounded-full bg-red-400"></div>
               <div className="w-3 h-3 rounded-full bg-amber-400"></div>
               <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <h5 className="font-semibold text-slate-700 text-xs sm:text-sm font-mono border-l border-slate-300 pl-4">src/utils/normalization.ts</h5>
          </div>
        </div>
        <div className="bg-slate-900 overflow-hidden">
            <div className="p-5 sm:p-6 text-slate-300 text-[12px] sm:text-[13px] font-mono leading-loose tabular-nums overflow-x-auto">
                <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">normalizeFeatureArray</span>(features: <span className="text-teal-300">number</span>[], bounds: <span className="text-teal-300">Bounds</span>) {'{'}</div>
                <div className="whitespace-pre">  <span className="text-pink-400">return</span> features.<span className="text-blue-400">map</span>((val, i) <span className="text-pink-400">=&gt;</span> {'{'}</div>
                <div className="whitespace-pre">    <span className="text-pink-400">const</span> range = bounds.max[i] - bounds.min[i];</div>
                <div className="whitespace-pre">    <span className="text-pink-400">if</span> (range === <span className="text-orange-300">0</span>) <span className="text-pink-400">return</span> <span className="text-orange-300">0</span>;</div>
                <div className="whitespace-pre">    <span className="text-pink-400">return</span> (val - bounds.min[i]) / range;</div>
                <div className="whitespace-pre">  {'}'});</div>
                <div className="whitespace-pre">{'}'}</div>
            </div>
            <div className="bg-slate-800/80 p-4 sm:p-5 border-t border-slate-700/50 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
             <strong className="font-semibold text-white">Tujuan:</strong> Menyetarakan batas rentang atribut agar algoritma Euclidean berjalan efektif tanpa distorsi bobot variabel bermagnitudo besar.
           </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex gap-1.5 shrink-0">
               <div className="w-3 h-3 rounded-full bg-red-400"></div>
               <div className="w-3 h-3 rounded-full bg-amber-400"></div>
               <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <h5 className="font-semibold text-slate-700 text-xs sm:text-sm font-mono border-l border-slate-300 pl-4">src/components/Predictor.tsx</h5>
          </div>
        </div>
        <div className="bg-slate-900 p-5 sm:p-6 overflow-x-auto">
          <div className="text-[12px] sm:text-[13px] font-mono leading-loose overflow-hidden tabular-nums">
            <div className="text-slate-500 italic whitespace-pre">// 1. Ekstraksi batas dari dataset acuan latih</div>
            <div className="whitespace-pre"><span className="text-pink-400">const</span> bounds = <span className="text-blue-400">getBounds</span>(hivDataset);</div>
            <div className="whitespace-pre"><span className="text-pink-400">const</span> normalizedTrainingX = <span className="text-blue-400">normalizeDataset</span>(hivDataset, bounds);</div>
            <div className="whitespace-pre"><span className="text-pink-400">const</span> trainingY = <span className="text-blue-400">getLabels</span>(hivDataset);</div>
            <br />
            <div className="text-slate-500 italic whitespace-pre">// 2. Transposisi dimensi matriks input</div>
            <div className="whitespace-pre"><span className="text-pink-400">const</span> normalizedUserInput = <span className="text-blue-400">normalizeFeatureArray</span>(userInput, bounds);</div>
            <br />
            <div className="text-slate-500 italic whitespace-pre">// 3. Eksekusi KNN Classifier (K=3 Tetangga terdekat)</div>
            <div className="whitespace-pre"><span className="text-pink-400">const</span> knn = <span className="text-pink-400">new</span> <span className="text-teal-300">KNN</span>(normalizedTrainingX, trainingY, {'{'} k: <span className="text-orange-300">3</span> {'}'});</div>
            <div className="whitespace-pre"><span className="text-pink-400">const</span> result = knn.<span className="text-blue-400">predict</span>(normalizedUserInput);</div>
            <div className="whitespace-pre"><span className="text-blue-400">setPrediction</span>(result);</div>
          </div>
        </div>
      </div>
    </div>
  );
}
