/**
 * PatientDashboard.tsx
 * ====================
 * Dashboard untuk role Patient — ringkas, informatif, mudah dinavigasi.
 * Menampilkan welcome message, quick actions, tips HIV, dan prediksi terakhir.
 */

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPredictionsByUser, PredictionData } from '../lib/firestore';
import {
  Zap, History, BookOpen, ArrowRight, Calendar, Clock,
  Shield, Heart, AlertTriangle, CheckCircle, Loader2, Stethoscope,
} from 'lucide-react';

const CLASS_LABELS: Record<number, string> = {
  0: 'Bukan ODHIV',
  1: 'ODHIV',
  2: 'Belum Tahu',
};

const TIPS = [
  { icon: Shield, title: 'Gunakan Kondom', desc: 'Penggunaan kondom secara konsisten mengurangi risiko penularan HIV hingga 95%.', color: 'bg-blue-100 text-blue-600' },
  { icon: Heart, title: 'Tes HIV Rutin', desc: 'Pemeriksaan HIV setidaknya setahun sekali sangat dianjurkan, terutama bagi yang berisiko.', color: 'bg-rose-100 text-rose-600' },
  { icon: AlertTriangle, title: 'Hindari NAPZA', desc: 'Penggunaan jarum suntik yang tidak steril merupakan salah satu jalur penularan HIV yang tinggi.', color: 'bg-amber-100 text-amber-600' },
];

export default function PatientDashboard() {
  const { userProfile } = useAuth();
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await getPredictionsByUser(userProfile?.uid || '');
        setPredictions(all.slice(0, 3));
      } catch { /* silent */ }
      setLoading(false);
    }
    if (userProfile) load();
    else setLoading(false);
  }, [userProfile]);

  function formatDate(ts: unknown) {
    if (!ts || typeof ts !== 'object' || !('toDate' in ts)) return '-';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ts as any).toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-sm text-white/50 uppercase tracking-widest font-semibold mb-2">{greeting()}</p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            {userProfile?.displayName || 'Pasien'}
          </h1>
          <p className="text-sm text-white/60 max-w-lg">
            Selamat datang di VECTRA. Gunakan sistem ini untuk memprediksi risiko HIV berdasarkan data klinis Anda.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NavLink to="/prediksi" className="group flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl hover:border-slate-900 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">Prediksi Baru</div>
            <div className="text-xs text-slate-500 mt-0.5">13 fitur — multi-step wizard</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
        </NavLink>

        <NavLink to="/riwayat" className="group flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl hover:border-slate-900 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <History className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">Riwayat Saya</div>
            <div className="text-xs text-slate-500 mt-0.5">Lihat semua prediksi sebelumnya</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
        </NavLink>

        <NavLink to="/pengetahuan" className="group flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl hover:border-slate-900 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">Pengetahuan</div>
            <div className="text-xs text-slate-500 mt-0.5">Pelajari cara kerja sistem</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
        </NavLink>
      </div>

      {/* Prediksi Terakhir */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Prediksi Terakhir</h2>
          {predictions.length > 0 && (
            <NavLink to="/riwayat" className="text-xs text-slate-400 hover:text-slate-900 font-semibold transition-colors">
              Lihat Semua →
            </NavLink>
          )}
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-10">
              <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-semibold">Belum Ada Prediksi</p>
              <p className="text-xs text-slate-400 mt-1">Mulai prediksi dari tombol di atas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{p.nama}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(p.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                    p.predictedClass === 1 ? 'bg-red-100 text-red-700' :
                    p.predictedClass === 2 ? 'bg-slate-100 text-slate-500' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {CLASS_LABELS[p.predictedClass] || p.predictedLabel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips HIV */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Tips Pencegahan HIV</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TIPS.map((tip, i) => (
            <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors">
              <div className={`w-10 h-10 ${tip.color} rounded-xl flex items-center justify-center mb-3`}>
                <tip.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{tip.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Catatan Penting:</strong> Sistem ini hanya untuk edukasi dan tugas kuliah. Bukan pengganti diagnosis dokter. Untuk diagnosis akurat, silakan ke fasyankes dan uji lab (ELISA / Western Blot).
        </p>
      </div>
    </div>
  );
}
