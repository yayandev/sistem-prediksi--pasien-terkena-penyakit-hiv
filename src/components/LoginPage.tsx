/**
 * LoginPage.tsx
 * ============
 * Halaman login dengan Google Sign-In.
 * Tampilan bersih, profesional, dengan branding VECTRA.
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal login. Coba lagi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Logo + Judul */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-900 rounded-2xl flex items-center justify-center">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">VECTRA</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistem Prediksi Pasien Terkena Penyakit HIV
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-slate-900 p-8">
          <div className="bg-slate-900 px-6 py-4 -mx-8 -mt-8 mb-6">
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">
              Masuk ke Sistem
            </h2>
          </div>

          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Masuk dengan akun Google Anda untuk mengakses sistem prediksi HIV.
            Data Anda aman dan tidak dibagikan ke pihak ketiga.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span className="text-sm font-semibold text-slate-700">
              {loading ? 'Masuk...' : 'Masuk dengan Google'}
            </span>
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-4">
            Dengan masuk, Anda menyetujui penggunaan data sesuai kebijakan privasi sistem.
          </p>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-400 text-center mt-6 uppercase tracking-widest">
          Tugas Machine Learning &bull; Universitas Banten Jaya
        </p>
      </div>
    </div>
  );
}
