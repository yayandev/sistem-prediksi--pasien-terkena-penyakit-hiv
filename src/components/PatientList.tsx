/**
 * PatientList.tsx
 * ==============
 * Halaman manajemen data pasien — tabel, search, tambah, hapus, export CSV.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  PatientData,
  getPatients,
  addPatient,
  deletePatient,
} from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { exportPatientsCSV } from '../lib/exportCSV';
import AddPatientModal from './AddPatientModal';

export default function PatientList() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    setLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus data pasien ini?')) return;
    setDeleting(id);
    try {
      await deletePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus';
      alert(msg);
    } finally {
      setDeleting(null);
    }
  }

  async function handleAddPatient(data: Omit<PatientData, 'id' | 'createdAt' | 'createdBy'>) {
    const id = await addPatient({ ...data, createdBy: user?.uid || '' });
    setPatients((prev) => [{ id, ...data, createdAt: null } as PatientData, ...prev]);
    setShowAddModal(false);
  }

  // Filter berdasarkan search
  const filtered = patients.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.jenis_kelamin.toLowerCase().includes(search.toLowerCase()) ||
      p.kelompok_populasi.toLowerCase().includes(search.toLowerCase()) ||
      p.status_odhiv.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 sm:pb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight uppercase">
          Data Pasien
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Kelola data pasien terdaftar. Tambah, hapus, dan export data ke CSV.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, jenis kelamin, status..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => exportPatientsCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Pasien</span>
          </button>
        </div>
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
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-white w-5 h-5" />
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">
              Daftar Pasien ({filtered.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
            <p className="text-sm text-slate-400 mt-2">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {search ? 'Tidak ditemukan data yang cocok' : 'Belum ada data pasien'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nama</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Usia</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Jenis Kelamin</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Kelompok Populasi</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Alasan Kunjungan</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{p.nama}</td>
                    <td className="px-6 py-4 text-slate-600">{p.umur}</td>
                    <td className="px-6 py-4 text-slate-600">{p.jenis_kelamin}</td>
                    <td className="px-6 py-4 text-slate-600">{p.kelompok_populasi}</td>
                    <td className="px-6 py-4 text-slate-600">{p.alasan_kunjungan}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 ${
                        p.status_odhiv === 'ODHIV'
                          ? 'bg-red-50 text-red-700'
                          : p.status_odhiv === 'Bukan ODHIV'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status_odhiv}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id!)}
                        disabled={deleting === p.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Hapus"
                      >
                        {deleting === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <AddPatientModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPatient}
        />
      )}
    </div>
  );
}
