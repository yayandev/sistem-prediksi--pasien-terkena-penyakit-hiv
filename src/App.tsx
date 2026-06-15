/**
 * App.tsx
 * =======
 * Root component untuk aplikasi VECTRA dengan React Router + Firebase Auth.
 *
 * Routes:
 *   /login        → Login (Google Sign-In)
 *   /             → Dashboard (ringkasan statistik)
 *   /prediksi     → Form prediksi HIV
 *   /pasien       → Data pasien (CRUD)
 *   /evaluasi     → Evaluasi Model (pipeline + confusion matrix)
 *   /pengetahuan  → Pusat Pengetahuan (dokumentasi)
 *   /tentang      → Tentang (info kelompok)
 *
 * Semua route (kecuali /login dan /tentang) dilindungi oleh ProtectedRoute.
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { Stethoscope, Menu, X, LogOut, User } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Predictor from './components/Predictor';
import PatientList from './components/PatientList';
import Documentation from './components/Documentation';
import ModelEvaluation from './components/ModelEvaluation';
import About from './components/About';

/**
 * Layout wrapper — header + footer + outlet untuk routes.
 */
function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Tutup mobile menu kalau pindah halaman
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Jangan tampilkan header di halaman login
  const isLoginPage = location.pathname === '/login';

  // Nav items — hanya tampilkan setelah login
  const navItems = user
    ? [
        { to: '/', label: 'Dashboard' },
        { to: '/prediksi', label: 'Prediksi' },
        { to: '/pasien', label: 'Pasien' },
        { to: '/evaluasi', label: 'Evaluasi' },
        { to: '/pengetahuan', label: 'Pengetahuan' },
        { to: '/tentang', label: 'Tentang' },
      ]
    : [
        { to: '/tentang', label: 'Tentang' },
      ];

  async function handleLogout() {
    try {
      await signOut();
    } catch {
      // silent fail
    }
  }

  if (isLoginPage) {
    // Sudah login? Redirect ke dashboard
    if (user) {
      return <Navigate to="/" replace />;
    }
    return (
      <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </main>
      </div>
    );
  }

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

          {/* Desktop User Info + Logout */}
          {user && (
            <div className="hidden md:flex items-center gap-3 ml-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <User className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <span className="max-w-[120px] truncate">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

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
            {user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            )}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/prediksi" element={<ProtectedRoute><Predictor /></ProtectedRoute>} />
          <Route path="/pasien" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
          <Route path="/evaluasi" element={<ProtectedRoute><ModelEvaluation /></ProtectedRoute>} />
          <Route path="/pengetahuan" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
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
 * Root App — bungkus dengan BrowserRouter + AuthProvider.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
