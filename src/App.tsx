import React, { useState } from 'react';
import Predictor from './components/Predictor';
import Documentation from './components/Documentation';
import { Stethoscope } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'predictor' | 'documentation'>('predictor');

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <header className="border-b border-slate-300 sticky top-0 z-10 w-full bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-0 sm:h-16 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
            <Stethoscope className="w-5 h-5 text-slate-700 shrink-0" />
            <span className="font-semibold text-base sm:text-lg tracking-tight uppercase text-center sm:text-left">VECTRA</span>
          </div>
          <nav className="flex gap-4 sm:gap-6 overflow-x-auto w-full sm:w-auto justify-center pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab('predictor')}
              className={`text-xs sm:text-sm whitespace-nowrap font-semibold uppercase tracking-wide transition-colors ${
                activeTab === 'predictor' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Evaluasi Risiko
            </button>
            <button
              onClick={() => setActiveTab('documentation')}
              className={`text-xs sm:text-sm whitespace-nowrap font-semibold uppercase tracking-wide transition-colors ${
                activeTab === 'documentation' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Pusat Pengetahuan
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {activeTab === 'predictor' ? (
          <>
            <div className="mb-8 sm:mb-12 border-b border-slate-200 pb-6 sm:pb-8 text-center max-w-2xl mx-auto">
              <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight uppercase">Sistem Prediksi Risiko Klinis</h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Formulir asesmen mandiri untuk mengevaluasi faktor risiko transmisi berdasarkan analisis pola historis dan algoritma klasifikasi Machine Learning terukur.
              </p>
            </div>
            <Predictor />
          </>
        ) : (
          <Documentation />
        )}
      </main>

      <footer className="mt-16 sm:mt-24 border-t border-slate-200 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <span className="font-semibold uppercase tracking-widest text-[10px] sm:text-xs text-slate-400">&copy; {new Date().getFullYear()} Unit Skrining & Machine Learning Terpadu.</span>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest">Sistem Pendukung Edukasi Medis • Validasi Model Internal</span>
        </div>
      </footer>
    </div>
  );
}
