/**
 * App.tsx
 * =======
 * Root component — React Router + Firebase Auth + Sidebar Layout.
 *
 * / (public)           → LandingPage (belum login)
 * /login               → LoginPage
 * /dashboard           → Admin/Patient Dashboard (protected)
 * /dashboard/prediksi  → Multi-step wizard (all roles)
 * /dashboard/riwayat   → Patient history (patient only)
 * /dashboard/pasien    → Patient list (admin only)
 * /dashboard/admin/users → User management (admin only)
 * /dashboard/evaluasi  → Model evaluation (admin only)
 * /dashboard/pengetahuan → Documentation (all roles)
 * /dashboard/tentang   → About (public)
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/Dashboard';
import PatientDashboard from './components/PatientDashboard';
import Predictor from './components/Predictor';
import PatientList from './components/PatientList';
import PatientHistory from './components/PatientHistory';
import AdminUsers from './components/AdminUsers';
import Documentation from './components/Documentation';
import ModelEvaluation from './components/ModelEvaluation';
import About from './components/About';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const isLoginPage = location.pathname === '/login';
  const isLandingPage = location.pathname === '/' && !user;
  const isFullPage = isLoginPage || isLandingPage;

  // Full-page: login & landing — no sidebar
  if (isFullPage) {
    if (isLoginPage && user) return <Navigate to="/dashboard" replace />;
    return (
      <div className="min-h-screen bg-white font-sans text-slate-800">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    );
  }

  // App layout with sidebar
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area — offset by sidebar width on desktop */}
      <div className="lg:pl-[260px]">
        {/* Top bar (mobile only) */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm uppercase tracking-tight">VECTRA</span>
            <div className="w-9" />
          </div>
        </header>

        {/* Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <Routes>
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
            <Route path="/dashboard" element={<ProtectedRoute>{isAdmin ? <AdminDashboard /> : <PatientDashboard />}</ProtectedRoute>} />
            <Route path="/dashboard/prediksi" element={<ProtectedRoute><Predictor /></ProtectedRoute>} />
            <Route path="/dashboard/riwayat" element={<ProtectedRoute><PatientHistory /></ProtectedRoute>} />
            <Route path="/dashboard/pasien" element={<ProtectedRoute requiredRole="admin"><PatientList /></ProtectedRoute>} />
            <Route path="/dashboard/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/dashboard/evaluasi" element={<ProtectedRoute requiredRole="admin"><ModelEvaluation /></ProtectedRoute>} />
            <Route path="/dashboard/pengetahuan" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
            <Route path="/dashboard/tentang" element={<About />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-8 sm:py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <span className="font-semibold uppercase tracking-widest text-[10px] sm:text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Kelompok 5 — Universitas Banten Jaya
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest">
              Tugas Machine Learning &bull; Sistem Prediksi Pasien Terkena Penyakit HIV
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
