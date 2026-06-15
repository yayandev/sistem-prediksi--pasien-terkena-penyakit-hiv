/**
 * AddPatientModal.tsx
 * ==================
 * Modal form untuk menambah data pasien baru.
 */

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { PatientData } from '../lib/firestore';

interface Props {
  onClose: () => void;
  onSubmit: (data: Omit<PatientData, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
}

const POPULASI_OPTIONS = [
  'LSL',
  'Pekerja Seks',
  'Pengguna Napza Suntik',
  'Populasi Umum',
  'Waria',
  'Pasien TB',
];

const ALASAN_OPTIONS = ['Kunjungan Rutin PDP', 'Tes HIV'];
const STATUS_OPTIONS = ['Belum Tahu', 'Bukan ODHIV', 'ODHIV'];

export default function AddPatientModal({ onClose, onSubmit }: Props) {
  const [nama, setNama] = useState('');
  const [umur, setUmur] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('Laki-laki');
  const [kelompokPopulasi, setKelompokPopulasi] = useState('Populasi Umum');
  const [alasanKunjungan, setAlasanKunjungan] = useState('Tes HIV');
  const [statusOdhiv, setStatusOdhiv] = useState('Belum Tahu');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama harus diisi');
      return;
    }
    if (!umur || Number(umur) < 0 || Number(umur) > 120) {
      setError('Usia harus antara 0-120');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit({
        nama: nama.trim(),
        umur: Number(umur),
        jenis_kelamin: jenisKelamin,
        kelompok_populasi: kelompokPopulasi,
        alasan_kunjungan: alasanKunjungan,
        status_odhiv: statusOdhiv,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white border-2 border-slate-900 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">
            Tambah Pasien Baru
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Nama */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors"
              placeholder="Masukkan nama pasien"
              required
            />
          </div>

          {/* Usia + JK */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Usia (tahun)
              </label>
              <input
                type="number"
                value={umur}
                onChange={(e) => setUmur(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                placeholder="0-120"
                min="0"
                max="120"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Jenis Kelamin
              </label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors bg-white"
              >
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>
          </div>

          {/* Kelompok Populasi */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Kelompok Populasi
            </label>
            <select
              value={kelompokPopulasi}
              onChange={(e) => setKelompokPopulasi(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors bg-white"
            >
              {POPULASI_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Alasan Kunjungan */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Alasan Kunjungan
            </label>
            <select
              value={alasanKunjungan}
              onChange={(e) => setAlasanKunjungan(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors bg-white"
            >
              {ALASAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Status ODHIV */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Status ODHIV
            </label>
            <select
              value={statusOdhiv}
              onChange={(e) => setStatusOdhiv(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
