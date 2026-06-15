/**
 * Dashboard.tsx
 * =============
 * Halaman utama setelah login — Admin-only.
 * Menampilkan ringkasan statistik, distribusi kelas, grafik prediksi terakhir, dan quick actions.
 */

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Brain,
  Activity,
  Plus,
  ArrowRight,
  BarChart3,
  Loader2,
  AlertCircle,
  Zap,
  FileText,
} from 'lucide-react';
import { getDashboardStats, DashboardStats } from '../lib/firestore';

const CLASS_COLORS: Record<string, string> = {
  'ODHIV': 'bg-red-500',
  'Bukan ODHIV': 'bg-emerald-500',
  'Belum Tahu': 'bg-amber-400',
};

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-slate-600">{error}</p>
          <button onClick={loadStats} className="mt-3 text-sm text-slate-900 font-semibold underline">
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  const s = stats!;
  const totalClass = (Object.values(s.classDistribution) as number[]).reduce((a, b) => a + b, 0);
  const totalPred = (Object.values(s.predictionDistribution) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 sm:pb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight uppercase">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Ringkasan statistik sistem prediksi HIV. Data diperbarui secara real-time dari Firestore.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Pasien" value={s.totalPatients} />
        <StatCard icon={Brain} label="Total Prediksi" value={s.totalPredictions} />
        <StatCard icon={Activity} label="Akurasi Model" value="90.5%" sub="K=3, 5-Fold CV" />
        <StatCard icon={BarChart3} label="Fitur Input" value="13" sub="Lengkap (klinis+sosial)" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NavLink to="/prediksi" className="flex items-center gap-4 p-5 bg-slate-900 text-white hover:bg-slate-800 transition-colors group">
          <Plus className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="flex-1">
            <div className="text-sm font-bold uppercase tracking-wide">Prediksi Baru</div>
            <div className="text-xs text-slate-400 mt-1">13 fitur — multi-step wizard</div>
          </div>
          <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </NavLink>
        <NavLink to="/pasien" className="flex items-center gap-4 p-5 border-2 border-slate-200 hover:border-slate-900 transition-colors group">
          <Users className="w-8 h-8 text-slate-400 group-hover:text-slate-900 transition-colors" />
          <div className="flex-1">
            <div className="text-sm font-bold uppercase tracking-wide text-slate-900">Data Pasien</div>
            <div className="text-xs text-slate-500 mt-1">Kelola data pasien terdaftar</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
        </NavLink>
        <NavLink to="/evaluasi" className="flex items-center gap-4 p-5 border-2 border-slate-200 hover:border-slate-900 transition-colors group">
          <Zap className="w-8 h-8 text-slate-400 group-hover:text-slate-900 transition-colors" />
          <div className="flex-1">
            <div className="text-sm font-bold uppercase tracking-wide text-slate-900">Evaluasi Model</div>
            <div className="text-xs text-slate-500 mt-1">Pipeline KNN + 13 fitur</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
        </NavLink>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Kelas Pasien */}
        <div className="bg-white border-2 border-slate-900">
          <div className="bg-slate-900 px-6 py-4">
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">Distribusi Kelas Pasien</h2>
          </div>
          <div className="p-6">
            {totalClass === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Belum ada data pasien</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(s.classDistribution).map(([label, count]) => {
                  const pct = Math.round((count as number / totalClass) * 100);
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">{label}</span>
                        <span className="text-xs text-slate-500">{count} pasien ({pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${CLASS_COLORS[label] || 'bg-slate-400'} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Distribusi Hasil Prediksi */}
        <div className="bg-white border-2 border-slate-900">
          <div className="bg-slate-900 px-6 py-4">
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">Distribusi Hasil Prediksi</h2>
          </div>
          <div className="p-6">
            {totalPred === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Belum ada prediksi</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(s.predictionDistribution).map(([label, count]) => {
                  const pct = Math.round((count as number / totalPred) * 100);
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">{label}</span>
                        <span className="text-xs text-slate-500">{count} kali ({pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${CLASS_COLORS[label] || 'bg-slate-400'} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prediksi Terakhir */}
      <div className="bg-white border-2 border-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">Prediksi Terakhir</h2>
          {s.recentPredictions.length > 0 && (
            <NavLink to="/pasien" className="text-xs text-slate-400 hover:text-white transition-colors">
              Lihat Semua →
            </NavLink>
          )}
        </div>
        <div className="p-6">
          {s.recentPredictions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Belum ada prediksi</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Nama</th>
                    <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Usia</th>
                    <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Hasil</th>
                    <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {s.recentPredictions.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-900">{p.nama}</td>
                      <td className="py-3 text-slate-600">{p.umur} th</td>
                      <td className="py-3">
                        <span className={`text-xs font-bold px-2 py-1 ${
                          p.predictedClass === 1 ? 'bg-red-50 text-red-700' :
                          p.predictedClass === 2 ? 'bg-slate-100 text-slate-500' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>{p.predictedLabel}</span>
                      </td>
                      <td className="py-3 text-slate-500 text-xs">
                        {p.createdAt ? p.createdAt.toDate().toLocaleDateString('id-ID') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-5 border border-slate-200 hover:border-slate-900 transition-colors group">
      <Icon className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors mb-3" />
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">{label}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}
