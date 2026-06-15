/**
 * PatientHistory.tsx
 * =================
 * Halaman riwayat prediksi untuk pasien — menampilkan semua prediksi milik user login.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPredictionsByUser, PredictionData } from '../lib/firestore';
import { History, Loader2, Calendar, Clock } from 'lucide-react';

const CLASS_LABELS: Record<number, string> = {
  0: 'Bukan ODHIV',
  1: 'ODHIV',
  2: 'Belum Tahu',
};

export default function PatientHistory() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      const data = await getPredictionsByUser(user.uid);
      setPredictions(data);
      setLoading(false);
    }
    load();
  }, [user]);

  function formatDate(ts: unknown) {
    if (!ts || typeof ts !== 'object' || !('toDate' in ts)) return '-';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ts as any).toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function formatTime(ts: unknown) {
    if (!ts || typeof ts !== 'object' || !('toDate' in ts)) return '-';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ts as any).toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight uppercase mb-2">
          Riwayat Prediksi
        </h1>
        <p className="text-sm text-slate-500">Semua hasil prediksi yang telah Anda lakukan</p>
      </div>

      {predictions.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-xl">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Belum Ada Riwayat Prediksi</p>
          <p className="text-xs text-slate-400 mt-1">Mulai prediksi dari halaman "Prediksi"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.map((p) => {
            const isOdhiv = p.predictedClass === 1;
            return (
              <div key={p.id} className="bg-white border border-slate-200 p-5 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{p.nama}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {p.umur} tahun &bull; {p.jenis_kelamin === 1 ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                    isOdhiv ? 'bg-red-100 text-red-700' : p.predictedClass === 2 ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'
                  }`}>
                    {p.predictedLabel}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(p.createdAt)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(p.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
