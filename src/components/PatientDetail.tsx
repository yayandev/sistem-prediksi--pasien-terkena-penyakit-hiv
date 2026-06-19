/**
 * PatientDetail.tsx
 * ================
 * Halaman detail pasien — menampilkan semua data pasien (13 fitur + status).
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatient, type PatientData } from '../lib/firestore';
import {
  ArrowLeft, Loader2, AlertTriangle, User, Users, Stethoscope,
  Activity, Heart, Shield, Pill, Clock, FileText, Info, Calendar,
  Check
} from 'lucide-react';

const FIELD_GROUPS = [
  {
    title: 'Data Diri',
    icon: User,
    fields: [
      { key: 'nama', label: 'Nama Lengkap', icon: User },
      { key: 'umur', label: 'Umur', icon: Clock, suffix: 'tahun' },
      { key: 'jenis_kelamin', label: 'Jenis Kelamin', icon: User },
      { key: 'status_pernikahan', label: 'Status Pernikahan', icon: User },
    ],
  },
  {
    title: 'Riwayat Klinis',
    icon: Stethoscope,
    fields: [
      { key: 'kelompok_populasi', label: 'Kelompok Populasi', icon: Users },
      { key: 'alasan_kunjungan', label: 'Alasan Kunjungan', icon: Stethoscope },
      { key: 'riwayat_tes_hiv', label: 'Riwayat Tes HIV', icon: Activity },
      { key: 'riwayat_ims', label: 'Riwayat IMS', icon: Activity },
      { key: 'gejala_klinis', label: 'Gejala Klinis', icon: Activity },
      { key: 'terapi_arv', label: 'Terapi ARV', icon: Pill },
    ],
  },
  {
    title: 'Gaya Hidup & Perilaku',
    icon: Shield,
    fields: [
      { key: 'jumlah_pasangan_seksual', label: 'Jumlah Pasangan Seksual', icon: Heart },
      { key: 'penggunaan_kondom', label: 'Penggunaan Kondom', icon: Shield },
      { key: 'penggunaan_napza_suntik', label: 'Penggunaan NAPZA Suntik', icon: Pill },
      { key: 'usia_pertama_hubungan', label: 'Usia Pertama Hubungan Seksual', icon: Clock },
    ],
  },
];

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getPatient(id);
        if (!data) setError('Pasien tidak ditemukan');
        else setPatient(data);
      } catch {
        setError('Gagal memuat data pasien');
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
    return (ts as any).toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  function getDisplayValue(key: string, value: unknown): string {
    if (value === null || value === undefined) return '-';
    if (key === 'usia_pertama_hubungan' && value === 0) return 'Belum pernah';
    return String(value);
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-slate-300" />
        <p className="text-sm font-semibold text-slate-500">{error || 'Data tidak ditemukan'}</p>
        <button
          onClick={() => navigate('/dashboard/pasien')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Data Pasien
        </button>
      </div>
    );
  }

  const p = patient;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/pasien')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Data Pasien
      </button>

      {/* Header Card */}
      <div className="bg-white border-2 border-slate-900 p-6 sm:p-8 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2 ${
          p.status_odhiv === 'ODHIV' ? 'bg-red-500' : p.status_odhiv === 'Bukan ODHIV' ? 'bg-emerald-500' : 'bg-amber-400'
        }`} />
        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-3">
            <Calendar className="w-3 h-3" />
            {formatDate(p.createdAt)} &bull; {formatTime(p.createdAt)}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shrink-0 ${
              p.status_odhiv === 'ODHIV' ? 'bg-red-100 text-red-700 border-2 border-red-200' :
              p.status_odhiv === 'Bukan ODHIV' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' :
              'bg-amber-100 text-amber-700 border-2 border-amber-200'
            }`}>
              {p.status_odhiv === 'ODHIV' ? '!' : p.status_odhiv === 'Bukan ODHIV' ? 'X' : '?'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{p.nama}</h1>
              <p className="text-sm text-slate-500">{p.umur} tahun &bull; {p.jenis_kelamin}</p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border-2 ${
            p.status_odhiv === 'ODHIV' ? 'border-red-200 bg-red-50' :
            p.status_odhiv === 'Bukan ODHIV' ? 'border-emerald-200 bg-emerald-50' :
            'border-amber-200 bg-amber-50'
          }`}>
            {p.status_odhiv === 'ODHIV' && <AlertTriangle className="w-5 h-5 text-red-600" />}
            {p.status_odhiv === 'Bukan ODHIV' && <Check className="w-5 h-5 text-emerald-600" />}
            {p.status_odhiv === 'Belum Tahu' && <Info className="w-5 h-5 text-amber-600" />}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Status</p>
              <p className={`text-lg font-black ${
                p.status_odhiv === 'ODHIV' ? 'text-red-700' : p.status_odhiv === 'Bukan ODHIV' ? 'text-emerald-700' : 'text-amber-700'
              }`}>{p.status_odhiv}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Field Groups */}
      {FIELD_GROUPS.map((group) => {
        const GroupIcon = group.icon;
        return (
          <div key={group.title} className="bg-white border-2 border-slate-900 p-6 sm:p-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-6 flex items-center gap-2">
              <GroupIcon className="w-4 h-4" />
              {group.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.fields.map((field) => {
                const FieldIcon = field.icon;
                const rawValue = (p as unknown as Record<string, unknown>)[field.key];
                const displayValue = getDisplayValue(field.key, rawValue);
                return (
                  <div key={field.key} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <FieldIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {displayValue}
                      {field.suffix && <span className="text-slate-400 font-normal ml-1">{field.suffix}</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Metadata */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metadata</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
          <div><strong>ID Pasien:</strong> <span className="font-mono">{p.id || '-'}</span></div>
          <div><strong>Dibuat:</strong> {formatDate(p.createdAt)} {formatTime(p.createdAt)}</div>
          {p.createdBy && <div><strong>Dibuat Oleh:</strong> <span className="font-mono">{p.createdBy}</span></div>}
        </div>
      </div>
    </div>
  );
}
