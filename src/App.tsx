/**
 * App.tsx
 * =======
 * Root component — React Router + Firebase Auth + Sidebar Layout.
 *
 * / (public)           → LandingPage (bisa diakses kapan saja)
 * /login               → LoginPage
 * /dashboard           → Admin/Patient Dashboard (protected)
 * /dashboard/prediksi  → Multi-step wizard (all roles)
 * /dashboard/riwayat   → Patient history (all roles)
 * /dashboard/pasien    → Patient list (admin only)
 * /dashboard/admin/users → User management (admin only)
 * /dashboard/evaluasi  → Model evaluation (all roles)
 * /dashboard/pengetahuan → Documentation (all roles)
 * /dashboard/tentang   → About (public)
 * /dashboard/profil    → Profile (all roles)
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
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
import PredictionDetail from './components/PredictionDetail';
import AdminUsers from './components/AdminUsers';
import Documentation from './components/Documentation';
import ModelEvaluation from './components/ModelEvaluation';
import About from './components/About';
import Profile from './components/Profile';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const isLoginPage = location.pathname === '/login';
  const isLandingPage = location.pathname === '/';
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
      <div className="lg:pl-[272px] min-h-screen flex flex-col">
        {/* Top bar (mobile only) */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 lg:hidden">
          <div className="flex items-center h-14 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center">
              <span className="font-bold text-sm uppercase tracking-tight">VECTRA</span>
            </div>
            <div className="w-9" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="max-w-[1200px] mx-auto">
            <Routes>
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute>{isAdmin ? <AdminDashboard /> : <PatientDashboard />}</ProtectedRoute>} />
              <Route path="/dashboard/prediksi" element={<ProtectedRoute><Predictor /></ProtectedRoute>} />
              <Route path="/dashboard/riwayat/:id" element={<ProtectedRoute><PredictionDetail /></ProtectedRoute>} />
              <Route path="/dashboard/riwayat" element={<ProtectedRoute><PatientHistory /></ProtectedRoute>} />
              <Route path="/dashboard/pasien" element={<ProtectedRoute requiredRole="admin"><PatientList /></ProtectedRoute>} />
              <Route path="/dashboard/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
              <Route path="/dashboard/evaluasi" element={<ProtectedRoute><ModelEvaluation /></ProtectedRoute>} />
              <Route path="/dashboard/pengetahuan" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
              <Route path="/dashboard/tentang" element={<About />} />
              <Route path="/dashboard/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-6 bg-white">
          <div className="px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-[11px] uppercase tracking-widest text-slate-400">
              &copy; {new Date().getFullYear()} Kelompok 5 — Universitas Banten Jaya
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
