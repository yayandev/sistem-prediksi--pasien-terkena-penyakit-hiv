/**
 * AdminHistory.tsx
 * ================
 * Halaman riwayat prediksi untuk admin — menampilkan SEMUA prediksi dari semua user.
 * Tabel komprehensif dengan search, pagination, dan link ke detail prediksi.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPredictions, PredictionData } from '../lib/firestore';
import {
  History, Loader2, Search, X, ChevronLeft, ChevronRight,
  Calendar, Clock, ChevronRight as ChevronR, AlertCircle,
  Download
} from 'lucide-react';
import { exportPredictionsCSV } from '../lib/exportCSV';

const CLASS_LABELS: Record<number, string> = {
  0: 'Belum Tahu',
  1: 'Bukan ODHIV',
  2: 'ODHIV',
};

const GENDER_MAP: Record<number, string> = { 0: 'Laki-laki', 1: 'Perempuan' };

const ITEMS_PER_PAGE = 15;

export default function AdminHistory() {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getPredictions();
      setPredictions(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { setCurrentPage(1); }, [search]);

  const filtered = predictions.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nama?.toLowerCase().includes(q) ||
      p.predictedLabel?.toLowerCase().includes(q) ||
      GENDER_MAP[p.jenis_kelamin]?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  function formatDate(ts: unknown) {
    if (!ts || typeof ts !== 'object' || !('toDate' in ts)) return '-';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ts as any).toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatTime(ts: unknown) {
    if (!ts || typeof ts !== 'object' || !('toDate' in ts)) return '-';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ts as any).toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 sm:pb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight uppercase">
          Riwayat Prediksi
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Semua hasil prediksi dari seluruh pengguna sistem. Klik baris untuk melihat detail lengkap.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, hasil prediksi, jenis kelamin..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => exportPredictionsCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border-2 border-slate-900 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <History className="text-white w-5 h-5" />
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">
            Semua Prediksi ({filtered.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
            <p className="text-sm text-slate-400 mt-2">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {search ? 'Tidak ditemukan data yang cocok' : 'Belum ada data prediksi'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nama</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Usia</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">JK</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Hasil</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tetangga</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, idx) => {
                  const isOdhiv = p.predictedClass === 2;
                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{startIdx + idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{p.nama}</td>
                      <td className="px-4 py-3 text-slate-600">{p.umur}</td>
                      <td className="px-4 py-3 text-slate-600">{GENDER_MAP[p.jenis_kelamin] || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 ${
                          isOdhiv ? 'bg-red-50 text-red-700' :
                          p.predictedClass === 1 ? 'bg-slate-100 text-slate-600' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {p.predictedLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                        {p.neighbors ? p.neighbors.length : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(p.createdAt)}</div>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(p.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/dashboard/riwayat/${p.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
                        >
                          Detail <ChevronR className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Menampilkan {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} data
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-2 border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 5) return true;
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - safePage) <= 1) return true;
                return false;
              })
              .reduce<(number | 'dots')[]>((acc, page, i, arr) => {
                if (i > 0 && page - (arr[i - 1] as number) > 1) acc.push('dots');
                acc.push(page);
                return acc;
              }, [])
              .map((item, i) =>
                item === 'dots' ? (
                  <span key={`dots-${i}`} className="px-1 text-slate-400">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`w-9 h-9 text-sm font-medium transition-colors ${
                      safePage === item
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-2 border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
