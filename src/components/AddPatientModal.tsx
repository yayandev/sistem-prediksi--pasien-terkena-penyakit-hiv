/**
 * AddPatientModal.tsx
 * ==================
 * Modal form untuk menambah data pasien baru — 13 input features.
 */

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { PatientData } from '../lib/firestore';

interface Props {
  onClose: () => void;
  onSubmit: (data: Omit<PatientData, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
}

const STATUS_OPTIONS = ['Belum Tahu', 'Bukan ODHIV', 'ODHIV'];
const POPULASI_OPTIONS = ['Umum', 'Waria', 'ODHA', 'Ibu Hamil', 'WBP'];
const ALASAN_OPTIONS = ['Konseling', 'Tes sukarela', 'Kontak serumah', 'Rujukan klinis', 'IMS', 'Ibu hamil'];
const RIWAYAT_HIV_OPTIONS = ['Belum pernah', 'Pernah (negatif)', 'Pernah (positif)'];
const RIWAYAT_IMS_OPTIONS = ['Tidak ada', 'Pernah', 'Sedang terjadi'];
const BOOL_OPTIONS = ['Ya', 'Tidak'];
const STATUS_NIKAH_OPTIONS = ['Belum Kawin', 'Kawin', 'Cerai'];
const GEJALA_OPTIONS = ['Tidak ada gejala', 'Gejala ringan', 'Gejala sedang', 'Gejala berat'];

export default function AddPatientModal({ onClose, onSubmit }: Props) {
  const [nama, setNama] = useState('');
  const [umur, setUmur] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('Laki-laki');
  const [kelompokPopulasi, setKelompokPopulasi] = useState('Umum');
  const [alasanKunjungan, setAlasanKunjungan] = useState('Konseling');
  const [riwayatTesHiv, setRiwayatTesHiv] = useState('Belum pernah');
  const [riwayatIms, setRiwayatIms] = useState('Tidak ada');
  const [jumlahPasangan, setJumlahPasangan] = useState('1');
  const [penggunaanKondom, setPenggunaanKondom] = useState('Ya');
  const [penggunaanNapza, setPenggunaanNapza] = useState('Tidak');
  const [statusPernikahan, setStatusPernikahan] = useState('Belum Kawin');
  const [usiaPertamaHubungan, setUsiaPertamaHubungan] = useState('20');
  const [terapiArv, setTerapiArv] = useState('Tidak');
  const [gejalaKlinis, setGejalaKlinis] = useState('Tidak ada gejala');
  const [statusOdhiv, setStatusOdhiv] = useState('Belum Tahu');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) { setError('Nama harus diisi'); return; }
    if (!umur || Number(umur) < 0 || Number(umur) > 120) { setError('Usia harus antara 0-120'); return; }

    setLoading(true);
    setError('');
    try {
      await onSubmit({
        nama: nama.trim(),
        umur: Number(umur),
        jenis_kelamin: jenisKelamin,
        kelompok_populasi: kelompokPopulasi,
        alasan_kunjungan: alasanKunjungan,
        riwayat_tes_hiv: riwayatTesHiv,
        riwayat_ims: riwayatIms,
        jumlah_pasangan_seksual: Number(jumlahPasangan),
        penggunaan_kondom: penggunaanKondom,
        penggunaan_napza_suntik: penggunaanNapza,
        status_pernikahan: statusPernikahan,
        usia_pertama_hubungan: Number(usiaPertamaHubungan),
        terapi_arv: terapiArv,
        gejala_klinis: gejalaKlinis,
        status_odhiv: statusOdhiv,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  }

  const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 bg-white">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white border-2 border-slate-900 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">Tambah Pasien Baru</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900" placeholder="Masukkan nama" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Usia</label>
              <input type="number" value={umur} onChange={(e) => setUmur(e.target.value)} className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900" min="0" max="120" required />
            </div>
            <SelectField label="Jenis Kelamin" value={jenisKelamin} onChange={setJenisKelamin} options={['Laki-laki', 'Perempuan']} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Kelompok Populasi" value={kelompokPopulasi} onChange={setKelompokPopulasi} options={POPULASI_OPTIONS} />
            <SelectField label="Alasan Kunjungan" value={alasanKunjungan} onChange={setAlasanKunjungan} options={ALASAN_OPTIONS} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Riwayat Tes HIV" value={riwayatTesHiv} onChange={setRiwayatTesHiv} options={RIWAYAT_HIV_OPTIONS} />
            <SelectField label="Riwayat IMS" value={riwayatIms} onChange={setRiwayatIms} options={RIWAYAT_IMS_OPTIONS} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Jumlah Pasangan Seksual</label>
              <input type="number" value={jumlahPasangan} onChange={(e) => setJumlahPasangan(e.target.value)} className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900" min="0" />
            </div>
            <SelectField label="Status Pernikahan" value={statusPernikahan} onChange={setStatusPernikahan} options={STATUS_NIKAH_OPTIONS} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Penggunaan Kondom" value={penggunaanKondom} onChange={setPenggunaanKondom} options={BOOL_OPTIONS} />
            <SelectField label="Penggunaan NAPZA Suntik" value={penggunaanNapza} onChange={setPenggunaanNapza} options={BOOL_OPTIONS} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Usia Pertama Hubungan</label>
              <input type="number" value={usiaPertamaHubungan} onChange={(e) => setUsiaPertamaHubungan(e.target.value)} className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900" min="10" max="30" />
            </div>
            <SelectField label="Terapi ARV" value={terapiArv} onChange={setTerapiArv} options={BOOL_OPTIONS} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Gejala Klinis" value={gejalaKlinis} onChange={setGejalaKlinis} options={GEJALA_OPTIONS} />
            <SelectField label="Status ODHIV" value={statusOdhiv} onChange={setStatusOdhiv} options={STATUS_OPTIONS} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
