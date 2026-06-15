/**
 * App.tsx
 * =======
 * Root component untuk aplikasi VECTRA dengan React Router.
 *
 * 4 halaman:
 *   /             → Evaluasi Risiko (form prediksi HIV)
 *   /evaluasi     → Evaluasi Model (pipeline + confusion matrix)
 *   /pengetahuan  → Pusat Pengetahuan (dokumentasi)
 *   /tentang      → Tentang (info kelompok)
 *
 * Responsive: ada hamburger menu di mobile, nav horizontal di desktop.
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Stethoscope, Menu, X } from 'lucide-react';
import Predictor from './components/Predictor';
import Documentation from './components/Documentation';
import ModelEvaluation from './components/ModelEvaluation';
import About from './components/About';

/**
 * Layout wrapper — header + footer + outlet untuk routes.
 */
function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Tutup mobile menu kalau pindah halaman
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: 'Evaluasi Risiko' },
    { to: '/evaluasi', label: 'Evaluasi Model' },
    { to: '/pengetahuan', label: 'Pengetahuan' },
    { to: '/tentang', label: 'Tentang' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-300 sticky top-0 z-50 w-full bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Stethoscope className="w-5 h-5 text-slate-700" />
            <span className="font-semibold text-base sm:text-lg tracking-tight uppercase">VECTRA</span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 text-xs font-semibold uppercase tracking-wide rounded-lg transition-colors ${
                    isActive
                      ? 'text-slate-900 bg-slate-100'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm font-semibold uppercase tracking-wide rounded-lg transition-colors ${
                    isActive
                      ? 'text-slate-900 bg-slate-100'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <Routes>
          <Route path="/" element={<Predictor />} />
          <Route path="/evaluasi" element={<ModelEvaluation />} />
          <Route path="/pengetahuan" element={<Documentation />} />
          <Route path="/tentang" element={<About />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <span className="font-semibold uppercase tracking-widest text-[10px] sm:text-xs text-slate-400">&copy; {new Date().getFullYear()} Kelompok 5 — Universitas Banten Jaya</span>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest">Tugas Machine Learning &bull; Sistem Prediksi Pasien Terkena Penyakit HIV</span>
        </div>
      </footer>
    </div>
  );
}

/**
 * Root App — bungkus dengan BrowserRouter.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
