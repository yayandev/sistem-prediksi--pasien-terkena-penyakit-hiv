/**
 * PredictionDetail.tsx
 * ===================
 * Halaman detail prediksi — menampilkan semua informasi lengkap
 * tentang satu prediksi yang sudah disimpan di riwayat.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPrediction, type PredictionData } from '../lib/firestore';
import {
  ArrowLeft, Loader2, Calendar, Clock, User, Target,
  BarChart3, Info, Check, AlertTriangle, Shield, Heart,
  Activity, Stethoscope, Pill, FileText, Users
} from 'lucide-react';

const CLASS_LABELS: Record<number, string> = {
  0: 'Belum Tahu',
  1: 'Bukan ODHIV',
  2: 'ODHIV',
};

const GENDER_MAP: Record<number, string> = { 0: 'Laki-laki', 1: 'Perempuan' };

const FEATURE_LABELS: Record<string, string> = {
  umur: 'Umur',
  jenis_kelamin: 'Jenis Kelamin',
  kelompok_populasi: 'Kelompok Populasi',
  alasan_kunjungan: 'Alasan Kunjungan',
  riwayat_tes_hiv: 'Riwayat Tes HIV',
  riwayat_ims: 'Riwayat IMS',
  jumlah_pasangan_seksual: 'Jumlah Pasangan Seksual',
  penggunaan_kondom: 'Penggunaan Kondom',
  penggunaan_napza_suntik: 'Penggunaan NAPZA Suntik',
  status_pernikahan: 'Status Pernikahan',
  usia_pertama_hubungan: 'Usia Pertama Hubungan',
  terapi_arv: 'Terapi ARV',
  gejala_klinis: 'Gejala Klinis',
};

export default function PredictionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getPrediction(id);
        if (!data) {
          setError('Prediksi tidak ditemukan');
        } else {
          setPrediction(data);
        }
      } catch {
        setError('Gagal memuat data prediksi');
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function formatDate(ts: unknown) {
    if (!ts || typeof ts !== 'object' || !('toDate' in ts)) return '-';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ts as any).toDate().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  function formatTime(ts: unknown) {
    if (!ts || typeof ts !== 'object' || !('toDate' in ts)) return '-';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ts as any).toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-slate-300" />
        <p className="text-sm font-semibold text-slate-500">{error || 'Data tidak ditemukan'}</p>
        <button
          onClick={() => navigate('/dashboard/riwayat')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Riwayat
        </button>
      </div>
    );
  }

  const p = prediction;
  const isOdhiv = p.predictedClass === 2;
  const isBukanOdhiv = p.predictedClass === 1;
  const isBelumTahu = p.predictedClass === 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/riwayat')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Riwayat
      </button>

      {/* Header Card */}
      <div className="bg-white border-2 border-slate-900 p-6 sm:p-8 relative overflow-hidden">
        {/* Decorative background */}
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2 ${
          isOdhiv ? 'bg-red-500' : isBukanOdhiv ? 'bg-slate-500' : 'bg-green-500'
        }`} />

        <div className="relative">
          <div className="flex items-start gap-2 text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-3">
            <Calendar className="w-3 h-3" />
            {formatDate(p.createdAt)} &bull; {formatTime(p.createdAt)}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shrink-0 ${
              isBelumTahu ? 'bg-green-100 text-green-700 border-2 border-green-200' :
              isBukanOdhiv ? 'bg-slate-100 text-slate-700 border-2 border-slate-200' :
              'bg-red-100 text-red-700 border-2 border-red-200'
            }`}>
              {isBelumTahu ? '?' : isBukanOdhiv ? 'X' : '!'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{p.nama}</h1>
              <p className="text-sm text-slate-500">{p.umur} tahun &bull; {GENDER_MAP[p.jenis_kelamin] || '-'}</p>
            </div>
          </div>

          {/* Prediction Result Badge */}
          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border-2 ${
            isBelumTahu ? 'border-green-200 bg-green-50' :
            isBukanOdhiv ? 'border-slate-200 bg-slate-50' :
            'border-red-200 bg-red-50'
          }`}>
            {isBelumTahu && <Info className="w-5 h-5 text-green-600" />}
            {isBukanOdhiv && <Check className="w-5 h-5 text-slate-600" />}
            {isOdhiv && <AlertTriangle className="w-5 h-5 text-red-600" />}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Hasil Prediksi</p>
              <p className={`text-lg font-black ${isBelumTahu ? 'text-green-700' : isBukanOdhiv ? 'text-slate-700' : 'text-red-700'}`}>
                {p.predictedLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="bg-white border-2 border-slate-900 p-6 sm:p-8">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-6 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Data Input Pasien
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(FEATURE_LABELS).map(([key, label]) => {
            const value = (p as unknown as Record<string, unknown>)[key];
            let displayValue = String(value ?? '-');

            if (key === 'jenis_kelamin') displayValue = GENDER_MAP[value as number] || '-';
            if (key === 'usia_pertama_hubungan' && value === 0) displayValue = 'Belum pernah';

            const icons: Record<string, React.ElementType> = {
              umur: User, jenis_kelamin: User, kelompok_populasi: Users,
              alasan_kunjungan: Stethoscope, riwayat_tes_hiv: Activity,
              riwayat_ims: Activity, jumlah_pasangan_seksual: Heart,
              penggunaan_kondom: Shield, penggunaan_napza_suntik: Pill,
              status_pernikahan: User, usia_pertama_hubungan: Clock,
              terapi_arv: Pill, gejala_klinis: Activity,
            };
            const Icon = icons[key] || Info;

            return (
              <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{displayValue}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Neighbor Details */}
      {p.neighbors && p.neighbors.length > 0 && (
        <div className="bg-white border-2 border-slate-900 p-6 sm:p-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-5 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Tetangga Terdekat (KNN)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Berikut adalah {p.neighbors.length} data training terdekat berdasarkan Euclidean Distance.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase">Rank</th>
                  <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase">Label</th>
                  <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase">Jarak</th>
                </tr>
              </thead>
              <tbody>
                {p.neighbors.map((n, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2.5 px-3 font-bold text-slate-700">#{n.rank || i + 1}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        n.label === 0 ? 'bg-green-100 text-green-700' :
                        n.label === 1 ? 'bg-slate-100 text-slate-600' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${n.label === 0 ? 'bg-green-500' : n.label === 1 ? 'bg-slate-400' : 'bg-red-500'}`} />
                        {CLASS_LABELS[n.label] || '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{typeof n.distance === 'number' ? n.distance.toFixed(4) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vote Breakdown */}
      {p.votes && (
        <div className="bg-white border-2 border-slate-900 p-6 sm:p-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Breakdown Suara Voting
          </h3>
          <div className="space-y-4">
            {[0, 1, 2].map((cls) => {
              const votes = p.votes[cls] || 0;
              const totalVotes = Object.values(p.votes).reduce((s, v) => s + v, 0);
              const pct = totalVotes > 0 ? votes / totalVotes : 0;
              const isWinner = cls === p.predictedClass;
              return (
                <div key={cls} className={`p-4 rounded-xl border-2 ${isWinner ? 'border-slate-900 bg-slate-50' : 'border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${cls === 0 ? 'bg-green-500' : cls === 1 ? 'bg-slate-400' : 'bg-red-500'}`} />
                      <span className="text-sm font-bold text-slate-900">{CLASS_LABELS[cls]}</span>
                      {isWinner && <span className="text-[10px] px-2 py-0.5 bg-slate-900 text-white rounded-full font-bold">MENANG</span>}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{votes} suara <span className="text-slate-400 font-normal">({(pct * 100).toFixed(0)}%)</span></span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cls === 0 ? 'bg-green-500' : cls === 1 ? 'bg-slate-400' : 'bg-red-500'}`} style={{ width: `${pct * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl text-xs text-amber-800 leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1">Disclaimer Medis</p>
          <p>Hasil prediksi ini bersifat <strong>skrining awal</strong> dan <strong>bukan diagnosis medis</strong>. Untuk kepastian, lakukan tes HIV di fasilitas kesehatan terdekat. Sistem ini menggunakan algoritma K-Nearest Neighbors (KNN) dengan data latih dari database sistem.</p>
        </div>
      </div>

    </div>
  );
}
