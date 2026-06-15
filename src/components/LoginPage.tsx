/**
 * LoginPage.tsx
 * ============
 * Halaman login & register — split layout desktop, full mobile.
 * Support Email/Password + Google Sign-In.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, Loader2, Mail, Lock, User, ArrowRight, Heart, Shield, Activity, KeyRound, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

type TabType = 'login' | 'register';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, registerWithEmail, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleGoogleLogin() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal login dengan Google');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }
    if (tab === 'register' && !name.trim()) {
      setError('Nama harus diisi');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name.trim());
      }
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Email atau password salah');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('Email sudah terdaftar');
      } else if (msg.includes('auth/weak-password')) {
        setError('Password minimal 6 karakter');
      } else if (msg.includes('auth/user-not-found')) {
        setError('Akun tidak ditemukan');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotMsg(null);
    if (!forgotEmail.trim()) {
      setForgotMsg({ type: 'error', text: 'Masukkan email terdaftar Anda' });
      return;
    }
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotMsg({ type: 'success', text: `Tautan reset password sudah dikirim ke ${forgotEmail}. Cek inbox atau spam Anda.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('auth/user-not-found')) {
        setForgotMsg({ type: 'error', text: 'Email tidak terdaftar di sistem' });
      } else if (msg.includes('auth/invalid-email')) {
        setForgotMsg({ type: 'error', text: 'Format email tidak valid' });
      } else {
        setForgotMsg({ type: 'error', text: msg || 'Gagal mengirim tautan reset' });
      }
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ============================================================
          LEFT PANEL — Branding (desktop only)
          ============================================================ */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-slate-800/50" />
        <div className="absolute bottom-[-120px] right-[-100px] w-[400px] h-[400px] rounded-full bg-slate-800/30" />
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-slate-700/20" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-slate-900" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">VECTRA</span>
          </div>
        </div>

        {/* Center: Tagline */}
        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
            Sistem Prediksi<br />
            Pasien Terkena<br />
            Penyakit HIV
          </h1>
          <p className="text-slate-400 text-base xl:text-lg leading-relaxed max-w-md">
            Platform machine learning untuk membantu tenaga medis memprediksi risiko HIV dengan algoritma KNN — cepat, akurat, dan berbasis data.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Shield, label: 'K-Nearest Neighbors' },
              { icon: Activity, label: '13 Fitur Klinis' },
              { icon: Heart, label: '200 Data Latih' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 rounded-full px-4 py-2">
                <f.icon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-300">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Footer */}
        <div className="relative z-10">
          <p className="text-[11px] text-slate-500 uppercase tracking-widest">
            Tugas Machine Learning &bull; Universitas Banten Jaya
          </p>
        </div>
      </div>

      {/* ============================================================
          RIGHT PANEL — Form
          ============================================================ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-slate-50">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-3 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">VECTRA</h1>
            <p className="text-xs text-slate-500 mt-1">Sistem Prediksi HIV</p>
          </div>

          {/* Welcome text */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {tab === 'login' ? 'Selamat datang kembali' : 'Buat akun baru'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {tab === 'login' ? 'Masuk untuk mengakses sistem prediksi.' : 'Daftar untuk mulai menggunakan VECTRA.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ============ FORGOT PASSWORD VIEW ============ */}
          {showForgot ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowForgot(false); setForgotMsg(null); setForgotEmail(''); }}
                  className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-600" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
                  <p className="text-xs text-slate-500">Masukkan email untuk menerima tautan reset</p>
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Alamat email terdaftar"
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  />
                </div>

                {forgotMsg && (
                  <div className={`p-3.5 rounded-xl flex items-start gap-3 ${forgotMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                    {forgotMsg.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${forgotMsg.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>{forgotMsg.text}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                >
                  {forgotLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Kirim Tautan Reset
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
          /* ============ NORMAL LOGIN/REGISTER VIEW ============ */
          <>
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Alamat email"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min. 6 karakter)"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>

            {/* Lupa Password link — hanya tampil di tab login */}
            {tab === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setForgotEmail(email); setForgotMsg(null); }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Lupa password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {tab === 'login' ? 'Masuk' : 'Daftar Sekarang'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          </>
          )}

          {/* Divider & Google — hanya tampil di form login/register */}
          {!showForgot && (
            <>
          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">atau</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-medium text-slate-700">Masuk dengan Google</span>
          </button>
            </>
          )}

          {/* Footer text */}
          <p className="text-[10px] text-slate-400 text-center mt-8 uppercase tracking-widest lg:hidden">
            Tugas Machine Learning &bull; Universitas Banten Jaya
          </p>
        </div>
      </div>
    </div>
  );
}
