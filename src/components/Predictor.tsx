/**
 * Predictor.tsx
 * ============
 * Multi-step wizard form (4 steps) untuk prediksi HIV.
 * 13 input features — 4 langkah:
 *   Step 1: Identitas (nama, umur, jenis_kelamin, status_pernikahan, kelompok_populasi)
 *   Step 2: Riwayat Kesehatan (riwayat_tes_hiv, riwayat_ims, terapi_arv, gejala_klinis)
 *   Step 3: Gaya Hidup (alasan_kunjungan, jumlah_pasangan_seksual, penggunaan_kondom, penggunaan_napza_suntik)
 *   Step 4: Hasil & Simpan
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addPrediction } from '../lib/firestore';
import { predict, loadTrainingData, encodeQueryForSave, getTrainingStats } from '../ml/runner';
import { ArrowLeft, ArrowRight, Zap, Check, AlertTriangle, Database, Save, Loader2, Trash2, Info, Target, BarChart3, Ruler } from 'lucide-react';
import PredictionProcess from './PredictionProcess';

interface PredictionResult {
  predictedClass: number;
  predictedLabel: string;
  confidence: number;
  neighbors: Array<{ label: number; labelName: string; distance: number; rank: number; features: number[] }>;
  votes: Record<number, number>;
  votePercentages: Record<number, number>;
  queryRaw: number[];
  queryRawStrings: string[];
  queryNormalized: number[];
  featureDistances: Array<{ feature: string; contribution: number }>;
  kUsed: number;
}

const CLASS_LABELS: Record<number, string> = {
  0: 'Belum Tahu',
  1: 'Bukan ODHIV',
  2: 'ODHIV',
};

const FEATURE_NAMES = [
  'Umur', 'Jenis Kelamin', 'Kelompok Populasi', 'Alasan Kunjungan',
  'Riwayat Tes HIV', 'Riwayat IMS', 'Jumlah Pasangan', 'Penggunaan Kondom',
  'NAPZA Suntik', 'Status Pernikahan', 'Usia Pertama Hubungan', 'Terapi ARV', 'Gejala Klinis',
];

const STEPS = [
  { id: 1, label: 'Identitas' },
  { id: 2, label: 'Riwayat Kesehatan' },
  { id: 3, label: 'Gaya Hidup' },
  { id: 4, label: 'Hasil' },
];

interface FormData {
  nama: string;
  umur: string;
  jenis_kelamin: string;
  kelompok_populasi: string;
  alasan_kunjungan: string;
  riwayat_tes_hiv: string;
  riwayat_ims: string;
  jumlah_pasangan_seksual: string;
  penggunaan_kondom: string;
  penggunaan_napza_suntik: string;
  status_pernikahan: string;
  usia_pertama_hubungan: string;
  terapi_arv: string;
  gejala_klinis: string;
}

const EMPTY_FORM: FormData = {
  nama: '', umur: '', jenis_kelamin: '', kelompok_populasi: '',
  alasan_kunjungan: '', riwayat_tes_hiv: '', riwayat_ims: '',
  jumlah_pasangan_seksual: '', penggunaan_kondom: '', penggunaan_napza_suntik: '',
  status_pernikahan: '', usia_pertama_hubungan: '', terapi_arv: '', gejala_klinis: '',
};

export default function Predictor() {
  const { user, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(() => ({
    ...EMPTY_FORM,
    nama: userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || '',
  }));
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [trainingDataLoaded, setTrainingDataLoaded] = useState(false);
  const [loadingTraining, setLoadingTraining] = useState(false);
  const [belumPernah, setBelumPernah] = useState(false);
  const [selectedK, setSelectedK] = useState(3);
  const [processing, setProcessing] = useState(false);
  const [bounds, setBounds] = useState<{ min: number[]; max: number[] } | null>(null);

  useEffect(() => {
    async function init() {
      setLoadingTraining(true);
      await loadTrainingData();
      const stats = getTrainingStats();
      setBounds(stats.bounds);
      setTrainingDataLoaded(true);
      setLoadingTraining(false);
    }
    init();
  }, []);

  const set = (field: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  function toNums(f: FormData) {
    return {
      umur: Number(f.umur) || 0,
      jenis_kelamin: f.jenis_kelamin || '',
      kelompok_populasi: f.kelompok_populasi || '',
      alasan_kunjungan: f.alasan_kunjungan || '',
      riwayat_tes_hiv: f.riwayat_tes_hiv || '',
      riwayat_ims: f.riwayat_ims || '',
      jumlah_pasangan_seksual: Number(f.jumlah_pasangan_seksual) || 0,
      penggunaan_kondom: f.penggunaan_kondom || '',
      penggunaan_napza_suntik: f.penggunaan_napza_suntik || '',
      status_pernikahan: f.status_pernikahan || '',
      usia_pertama_hubungan: belumPernah ? 0 : Number(f.usia_pertama_hubungan) || 0,
      terapi_arv: f.terapi_arv || '',
      gejala_klinis: f.gejala_klinis || '',
    };
  }

  function runPrediction() {
    setError('');
    const nums = toNums(form);
    if (!form.umur || !form.jenis_kelamin) {
      setError('Umur dan Jenis Kelamin wajib diisi');
      return;
    }
    setProcessing(true);
  }

  const onProcessingComplete = useCallback(() => {
    const nums = toNums(form);
    try {
      const pred = predict(nums, selectedK);
      setResult(pred);
      setProcessing(false);
      setStep(4);
    } catch (err: unknown) {
      setProcessing(false);
      setError(err instanceof Error ? err.message : 'Gagal menjalankan prediksi');
    }
  }, [form, selectedK]);

  async function handleSave() {
    if (!result || !user) return;
    setSaving(true);
    try {
      const nums = toNums(form);
      const encoded = encodeQueryForSave(nums);
      await addPrediction({
        patientId: '',
        nama: form.nama || 'Tanpa Nama',
        ...nums,
        ...encoded,
        predictedClass: result.predictedClass,
        predictedLabel: result.predictedLabel,
        neighbors: result.neighbors,
        votes: result.votes,
        createdBy: user.uid,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setResult(null);
    setSaved(false);
    setError('');
    setStep(1);
    setBelumPernah(false);
  }

  const canNext = () => {
    if (step === 1) return form.umur && form.jenis_kelamin;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight uppercase mb-2">
          Prediksi Risiko HIV
        </h1>
        <p className="text-sm text-slate-500">
          Masukkan data pasien lengkap untuk prediksi berbasis algoritma KNN
        </p>
      </div>

      {/* Training Data Status */}
      <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded-lg">
        {loadingTraining ? (
          <><Loader2 className="w-4 h-4 animate-spin text-slate-400" /> <span>Memuat data training...</span></>
        ) : trainingDataLoaded ? (
          <><Database className="w-4 h-4 text-green-600" /> <span>Siap digunakan (13 fitur, 200 data training)</span></>
        ) : (
          <><AlertTriangle className="w-4 h-4 text-amber-500" /> <span>Data belum dimuat</span></>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => s.id < step && setStep(s.id)}
              disabled={s.id > step}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase transition-all ${
                step === s.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : s.id < step
                  ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {s.id < step ? <Check className="w-3.5 h-3.5" /> : <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{s.id}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${s.id < step ? 'bg-green-300' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Step 1: Identitas */}
      {step === 1 && (
        <div className="bg-white border-2 border-slate-900 p-6 sm:p-8 space-y-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-5">Identitas Pasien</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Nama (opsional)</label>
              <input type="text" value={form.nama} onChange={(e) => set('nama', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Umur *</label>
              <input type="number" value={form.umur} onChange={(e) => set('umur', e.target.value)} placeholder="18-80" className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Jenis Kelamin *</label>
              <select value={form.jenis_kelamin} onChange={(e) => set('jenis_kelamin', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Status Pernikahan</label>
              <select value={form.status_pernikahan} onChange={(e) => set('status_pernikahan', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai">Cerai</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Kelompok Populasi</label>
              <select value={form.kelompok_populasi} onChange={(e) => set('kelompok_populasi', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option value="Umum">Umum</option>
                <option value="Waria">Waria</option>
                <option value="ODHA">ODHA</option>
                <option value="Ibu Hamil">Ibu Hamil</option>
                <option value="WBP">WBP</option>
                <option value="Pekerja Seks">Pekerja Seks</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Riwayat Kesehatan */}
      {step === 2 && (
        <div className="bg-white border-2 border-slate-900 p-6 sm:p-8 space-y-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-5">Riwayat Kesehatan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Riwayat Tes HIV</label>
              <select value={form.riwayat_tes_hiv} onChange={(e) => set('riwayat_tes_hiv', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option value="Belum pernah">Belum pernah</option>
                <option value="Pernah (negatif)">Pernah (negatif)</option>
                <option value="Pernah (positif)">Pernah (positif)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Riwayat IMS</label>
              <select value={form.riwayat_ims} onChange={(e) => set('riwayat_ims', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option value="Tidak ada">Tidak ada</option>
                <option value="Pernah">Pernah</option>
                <option value="Sedang terjadi">Sedang terjadi</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Terapi ARV</label>
              <select value={form.terapi_arv} onChange={(e) => set('terapi_arv', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option value="Ya">Ya</option>
                <option value="Tidak">Tidak</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Gejala Klinis</label>
              <select value={form.gejala_klinis} onChange={(e) => set('gejala_klinis', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option value="Tidak ada gejala">Tidak ada gejala</option>
                <option value="Gejala ringan">Gejala ringan</option>
                <option value="Gejala sedang">Gejala sedang</option>
                <option value="Gejala berat">Gejala berat</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Gaya Hidup */}
      {step === 3 && (
        <div className="bg-white border-2 border-slate-900 p-6 sm:p-8 space-y-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-5">Gaya Hidup & Perilaku</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Alasan Kunjungan</label>
              <select value={form.alasan_kunjungan} onChange={(e) => set('alasan_kunjungan', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option value="Konseling">Konseling</option>
                <option value="Tes sukarela">Tes sukarela</option>
                <option value="Kontak serumah">Kontak serumah</option>
                <option value="Rujukan klinis">Rujukan klinis</option>
                <option value="IMS">IMS</option>
                <option value="Ibu hamil">Ibu hamil</option>
                <option value="Tes HIV">Tes HIV</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Jumlah Pasangan Seksual</label>
              <input type="number" value={form.jumlah_pasangan_seksual} onChange={(e) => set('jumlah_pasangan_seksual', e.target.value)} placeholder="0-20" className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Penggunaan Kondom</label>
              <select value={form.penggunaan_kondom} onChange={(e) => set('penggunaan_kondom', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option value="Ya">Ya</option>
                <option value="Tidak">Tidak</option>
                <option value="Selalu">Selalu</option>
                <option value="Kadang-kadang">Kadang-kadang</option>
                <option value="Tidak Pernah">Tidak Pernah</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Penggunaan NAPZA Suntik</label>
              <select value={form.penggunaan_napza_suntik} onChange={(e) => set('penggunaan_napza_suntik', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option value="Ya">Ya</option>
                <option value="Tidak">Tidak</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Usia Pertama Hubungan Seksual</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={belumPernah}
                    onChange={(e) => {
                      setBelumPernah(e.target.checked);
                      if (e.target.checked) set('usia_pertama_hubungan', '0');
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-sm text-slate-600">Belum pernah berhubungan seksual</span>
                </label>
                {!belumPernah && (
                  <input
                    type="number"
                    value={form.usia_pertama_hubungan}
                    onChange={(e) => set('usia_pertama_hubungan', e.target.value)}
                    placeholder="10-30"
                    min={10}
                    max={30}
                    className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Animation */}
      {processing && (
        <PredictionProcess onComplete={onProcessingComplete} />
      )}

      {/* Step 4: Hasil */}
      {step === 4 && result && (
        <div className="space-y-6">

          {/* 1. Hasil Utama — Prediksi + Confidence */}
          <div className="bg-white border-2 border-slate-900 p-6 sm:p-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-6">Hasil Prediksi</h3>
            <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0 ${
                result.predictedClass === 0 ? 'bg-green-100 text-green-700 border-2 border-green-200' :
                result.predictedClass === 1 ? 'bg-slate-100 text-slate-700 border-2 border-slate-200' :
                'bg-red-100 text-red-700 border-2 border-red-200'
              }`}>
                {result.predictedClass === 0 ? '?' : result.predictedClass === 1 ? 'X' : '!'}
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-500 uppercase font-semibold mb-1">Prediksi Sistem</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{result.predictedLabel}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Confidence:</span>
                  <div className="flex-1 max-w-[200px] h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${result.confidence >= 0.6 ? 'bg-green-500' : result.confidence >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${result.confidence * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">K = {result.kUsed} tetangga • {result.votes[result.predictedClass]} dari {result.kUsed} suara</p>
              </div>
            </div>

            {/* Interpretasi Hasil */}
            <div className={`p-4 rounded-xl border text-sm leading-relaxed ${
              result.predictedClass === 0 ? 'bg-green-50 border-green-200 text-green-800' :
              result.predictedClass === 1 ? 'bg-slate-50 border-slate-200 text-slate-700' :
              'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start gap-2 mb-1.5">
                {result.predictedClass === 0 && <Info className="w-4 h-4 mt-0.5 shrink-0" />}
                {result.predictedClass === 1 && <Check className="w-4 h-4 mt-0.5 shrink-0" />}
                {result.predictedClass === 2 && <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span className="font-bold">
                  {result.predictedClass === 0 && 'Status Belum Diketahui'}
                  {result.predictedClass === 1 && 'Bukan ODHIV (Orang Dengan HIV)'}
                  {result.predictedClass === 2 && 'ODHIV (Orang Dengan HIV)'}
                </span>
              </div>
              <p className="text-xs opacity-80">
                {result.predictedClass === 0 && 'Pasien terdeteksi memiliki karakteristik "Belum Tahu" — kemungkinan belum pernah melakukan tes HIV atau hasil tes sebelumnya tidak tersedia.'}
                {result.predictedClass === 1 && 'Berdasarkan {result.kUsed} pasien terdekat, mayoritas diklasifikasikan sebagai Bukan ODHIV. Tidak ditemukan indikasi kuat terinfeksi HIV berdasarkan fitur yang dimasukkan.'}
                {result.predictedClass === 2 && 'Berdasarkan {result.kUsed} pasien terdekat, terdapat indikasi kuat terinfeksi HIV. Segera lakukan tes konfirmasi di fasilitas kesehatan terdekat.'}
              </p>
            </div>
          </div>

          {/* 2. Voting Breakdown */}
          <div className="bg-white border-2 border-slate-900 p-6 sm:p-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Breakdown Suara Voting (K={result.kUsed})
            </h3>
            <p className="text-xs text-slate-500 mb-5">Algoritma KNN mengumpulkan suara dari {result.kUsed} tetangga terdekat. Kelas dengan suara terbanyak menang.</p>
            <div className="space-y-4">
              {[0, 1, 2].map((cls) => {
                const votes = result.votes[cls] || 0;
                const pct = result.votePercentages[cls] || 0;
                const isWinner = cls === result.predictedClass;
                return (
                  <div key={cls} className={`p-4 rounded-xl border-2 transition-all ${isWinner ? 'border-slate-900 bg-slate-50' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cls === 0 ? 'bg-green-500' : cls === 1 ? 'bg-slate-400' : 'bg-red-500'}`} />
                        <span className="text-sm font-bold text-slate-900">{CLASS_LABELS[cls]}</span>
                        {isWinner && <span className="text-[10px] px-2 py-0.5 bg-slate-900 text-white rounded-full font-bold">MENANG</span>}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{votes} suara <span className="text-slate-400 font-normal">({(pct * 100).toFixed(0)}%)</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${cls === 0 ? 'bg-green-500' : cls === 1 ? 'bg-slate-400' : 'bg-red-500'}`} style={{ width: `${pct * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Detail Tetangga Terdekat */}
          <div className="bg-white border-2 border-slate-900 p-6 sm:p-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-5 flex items-center gap-2">
              <Target className="w-4 h-4" />
              {result.kUsed} Tetangga Terdekat
            </h3>
            <p className="text-xs text-slate-500 mb-4">Jarak dihitung menggunakan Euclidean Distance. Semakin kecil jarak, semakin mirip tetangga tersebut dengan data pasien.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase">Rank</th>
                    <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase">Label</th>
                    <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase">Jarak (d)</th>
                    <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase">Bobot (1/d)</th>
                    <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase">Kontribusi</th>
                  </tr>
                </thead>
                <tbody>
                  {result.neighbors.map((n) => {
                    const weight = n.distance > 0 ? 1 / n.distance : 0;
                    const maxWeight = Math.max(...result.neighbors.map(nb => nb.distance > 0 ? 1 / nb.distance : 0));
                    const barWidth = maxWeight > 0 ? (weight / maxWeight) * 100 : 0;
                    return (
                      <tr key={n.rank} className={`border-b border-slate-100 ${n.label === result.predictedClass ? 'bg-slate-50' : ''}`}>
                        <td className="py-2.5 px-3 font-bold text-slate-700">#{n.rank}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            n.label === 0 ? 'bg-green-100 text-green-700' :
                            n.label === 1 ? 'bg-slate-100 text-slate-600' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${n.label === 0 ? 'bg-green-500' : n.label === 1 ? 'bg-slate-400' : 'bg-red-500'}`} />
                            {n.labelName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{n.distance.toFixed(4)}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{weight.toFixed(4)}</td>
                        <td className="py-2.5 px-3">
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-400 rounded-full" style={{ width: `${barWidth}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Kontribusi Fitur — Fitur mana yang paling menentukan */}
          {result.featureDistances.length > 0 && (
            <div className="bg-white border-2 border-slate-900 p-6 sm:p-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-5 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Kontribusi Fitur terhadap Jarak
              </h3>
              <p className="text-xs text-slate-500 mb-4">Fitur dengan kontribusi jarak terbesar paling mempengaruhi hasil prediksi. Semakin besar, semakin berbeda data pasien dengan tetangganya pada fitur tersebut.</p>
              <div className="space-y-3">
                {result.featureDistances.slice(0, 8).map((f, i) => {
                  const maxContrib = result.featureDistances[0]?.contribution || 1;
                  const pct = (f.contribution / maxContrib) * 100;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-36 text-right shrink-0">{f.feature}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-700 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 w-12">{f.contribution.toFixed(3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Penjelasan Proses KNN */}
          <div className="bg-slate-50 border border-slate-200 p-6 sm:p-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-4">Cara Kerja KNN pada Prediksi Ini</h3>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p><strong>Normalisasi:</strong> Seluruh 13 fitur input dinormalisasi ke rentang [0, 1] menggunakan metode Min-Max Scaling agar setiap fitur memiliki bobot yang setara.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p><strong>Euclidean Distance:</strong> Jarak dihitung ke seluruh {result.kUsed} pasien pada data training menggunakan rumus: d = &radic;&Sigma;(x<sub>i</sub> - y<sub>i</sub>)&sup2;</p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p><strong>Pemilihan K Tetangga:</strong> Diambil {result.kUsed} data training dengan jarak terkecil (paling mirip) dari data pasien.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                <p><strong>Majority Voting:</strong> Kelas yang paling banyak muncul di antara {result.kUsed} tetangga menjadi hasil prediksi: <strong className="text-slate-900">{result.predictedLabel}</strong> ({result.votes[result.predictedClass]}/{result.kUsed} suara).</p>
              </div>
            </div>
          </div>

          {/* 6. Alur Perhitungan KNN — Step-by-step */}
          <div className="bg-white border-2 border-slate-900 p-6 sm:p-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-6 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Alur Perhitungan KNN — Rumus Lengkap
            </h3>

            {/* ===== STEP 1: ENCODING ===== */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                <h4 className="text-sm font-bold text-slate-900">LabelEncoder — Encoding Kategorikal ke Numerik</h4>
              </div>

              {/* Rumus */}
              <div className="ml-8 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2">Rumus:</p>
                <div className="bg-white rounded-lg p-3 border border-slate-100 mb-3">
                  <code className="text-xs text-slate-800 font-mono">
                    encoded_value = index(sorted_unique_classes).indexOf(input_string)
                  </code>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Setiap nilai unik pada suatu fitur kategorikal diurutkan secara <strong>alfabetis</strong>, lalu mendapat indeks mulai dari 0.
                  Proses ini diperlukan karena KNN hanya bisa bekerja dengan angka, bukan teks.
                </p>
              </div>

              {/* Contoh */}
              <div className="ml-8 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2">Contoh pada fitur "Jenis Kelamin":</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-mono text-slate-600">Urutan alfabet: Laki-laki, Perempuan</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p>→ <strong>Laki-laki</strong> = indeks ke-0 = <code className="bg-white px-1 rounded font-bold text-slate-900">0</code></p>
                  <p>→ <strong>Perempuan</strong> = indeks ke-1 = <code className="bg-white px-1 rounded font-bold text-slate-900">1</code></p>
                </div>
              </div>

              {/* Tabel */}
              <div className="ml-8 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-1.5 px-2 font-bold text-slate-500 uppercase">Fitur</th>
                      <th className="text-left py-1.5 px-2 font-bold text-slate-500 uppercase">Input (Asli)</th>
                      <th className="text-right py-1.5 px-2 font-bold text-slate-500 uppercase">Encoded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURE_NAMES.map((name, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-1 px-2 text-slate-600">{name}</td>
                        <td className="py-1 px-2 text-slate-700 font-mono">{result.queryRawStrings[i]}</td>
                        <td className="py-1 px-2 text-right font-mono text-slate-900 font-bold">{result.queryRaw[i]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ===== STEP 2: NORMALISASI ===== */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                <h4 className="text-sm font-bold text-slate-900">Min-Max Normalization</h4>
              </div>

              {/* Rumus */}
              <div className="ml-8 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2">Rumus:</p>
                <div className="bg-white rounded-lg p-3 border border-slate-100 mb-3">
                  <code className="text-xs text-slate-800 font-mono">
                    x' = (x - min) / (max - min)
                  </code>
                </div>
                <p className="text-xs font-bold text-slate-700 mb-1">Keterangan simbol:</p>
                <div className="text-[11px] text-slate-600 space-y-0.5 mb-3">
                  <p><code className="bg-white px-1 rounded font-bold">x'</code> = nilai fitur setelah normalisasi (rentang 0 s/d 1)</p>
                  <p><code className="bg-white px-1 rounded font-bold">x</code> = nilai fitur asli (sebelum normalisasi)</p>
                  <p><code className="bg-white px-1 rounded font-bold">min</code> = nilai minimum pada fitur tersebut di seluruh data training</p>
                  <p><code className="bg-white px-1 rounded font-bold">max</code> = nilai maximum pada fitur tersebut di seluruh data training</p>
                  <p><code className="bg-white px-1 rounded font-bold">(max - min)</code> = range / rentang nilai fitur</p>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong>Tujuan:</strong> Agar semua fitur memiliki skala yang sama (0–1), sehingga fitur dengan angka besar (misal: Umur=50) tidak mendominasi jarak dibanding fitur kecil (misal: jumlah kondom=1).
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  <strong>Clamp:</strong> Jika hasil normalisasi &lt; 0 atau &gt; 1, maka dibatasi ke 0 atau 1 (mencegah data outlier di luar range training).
                </p>
              </div>

              {/* Tabel */}
              {bounds && (
                <div className="ml-8 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-1.5 px-2 font-bold text-slate-500 uppercase">Fitur</th>
                        <th className="text-right py-1.5 px-2 font-bold text-slate-500 uppercase">x</th>
                        <th className="text-right py-1.5 px-2 font-bold text-slate-500 uppercase">min</th>
                        <th className="text-right py-1.5 px-2 font-bold text-slate-500 uppercase">max</th>
                        <th className="text-right py-1.5 px-2 font-bold text-slate-500 uppercase">Rumus</th>
                        <th className="text-right py-1.5 px-2 font-bold text-slate-500 uppercase">x'</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FEATURE_NAMES.map((name, i) => {
                        const raw = result.queryRaw[i];
                        const min = bounds.min[i];
                        const max = bounds.max[i];
                        const range = max - min;
                        const norm = range === 0 ? 0 : Math.min(1, Math.max(0, (raw - min) / range));
                        const formula = range === 0
                          ? `range=0 → 0`
                          : `(${raw} - ${min}) / (${max} - ${min}) = ${(raw - min).toFixed(2)} / ${range.toFixed(2)}`;
                        return (
                          <tr key={i} className="border-b border-slate-50">
                            <td className="py-1 px-2 text-slate-600">{name}</td>
                            <td className="py-1 px-2 text-right font-mono text-slate-700">{raw}</td>
                            <td className="py-1 px-2 text-right font-mono text-slate-400">{min}</td>
                            <td className="py-1 px-2 text-right font-mono text-slate-400">{max}</td>
                            <td className="py-1 px-2 text-right font-mono text-slate-500 text-[10px]">{formula}</td>
                            <td className="py-1 px-2 text-right font-mono text-slate-900 font-bold">{norm.toFixed(4)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ===== STEP 3: EUCLIDEAN DISTANCE ===== */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                <h4 className="text-sm font-bold text-slate-900">Euclidean Distance (Jarak Euclidean)</h4>
              </div>

              {/* Rumus */}
              <div className="ml-8 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2">Rumus umum:</p>
                <div className="bg-white rounded-lg p-3 border border-slate-100 mb-3">
                  <code className="text-xs text-slate-800 font-mono leading-relaxed block">
                    d(Q, T) = &radic;( (Q<sub>1</sub> - T<sub>1</sub>)&sup2; + (Q<sub>2</sub> - T<sub>2</sub>)&sup2; + ... + (Q<sub>n</sub> - T<sub>n</sub>)&sup2; )
                  </code>
                  <code className="text-xs text-slate-800 font-mono block mt-1">
                    d(Q, T) = &radic;&Sigma;<sub>i=1..n</sub> (Q<sub>i</sub> - T<sub>i</sub>)&sup2;
                  </code>
                </div>
                <p className="text-xs font-bold text-slate-700 mb-1">Keterangan simbol:</p>
                <div className="text-[11px] text-slate-600 space-y-0.5 mb-3">
                  <p><code className="bg-white px-1 rounded font-bold">d(Q, T)</code> = jarak Euclidean antara data query (Q) dan data tetangga (T)</p>
                  <p><code className="bg-white px-1 rounded font-bold">Q</code> = data pasien yang akan diprediksi (query input, sudah dinormalisasi)</p>
                  <p><code className="bg-white px-1 rounded font-bold">T</code> = data tetangga dari data training (sudah dinormalisasi)</p>
                  <p><code className="bg-white px-1 rounded font-bold">Q<sub>i</sub></code> = nilai fitur ke-i pada data query</p>
                  <p><code className="bg-white px-1 rounded font-bold">T<sub>i</sub></code> = nilai fitur ke-i pada data tetangga</p>
                  <p><code className="bg-white px-1 rounded font-bold">n</code> = jumlah total fitur = 13</p>
                  <p><code className="bg-white px-1 rounded font-bold">(Q<sub>i</sub> - T<sub>i</sub>)</code> = selisih (beda) nilai fitur ke-i antara query dan tetangga</p>
                  <p><code className="bg-white px-1 rounded font-bold">(Q<sub>i</sub> - T<sub>i</sub>)&sup2;</code> = kuadrat dari selisih (membuat semua nilai positif & menonjolkan perbedaan besar)</p>
                  <p><code className="bg-white px-1 rounded font-bold">&Sigma;</code> = simbol penjumlahan (sigma) — menjumlahkan semua kuadrat selisih dari fitur ke-1 sampai ke-n</p>
                  <p><code className="bg-white px-1 rounded font-bold">&radic;</code> = simbol akar kuadrat — mengembalikan satuan ke skala asli</p>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong>Interpretasi:</strong> Semakin <strong>kecil</strong> nilai d, semakin <strong>mirip</strong> data pasien dengan tetangga tersebut.
                  Semakin <strong>besar</strong> nilai d, semakin <strong>berbeda</strong> keduanya.
                </p>
              </div>

              {/* Contoh perhitungan manual */}
              <div className="ml-8 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2">Contoh perhitungan manual (Tetangga #{result.neighbors[0]?.rank}):</p>
                {result.neighbors[0] && (() => {
                  const n = result.neighbors[0];
                  const f0q = result.queryNormalized[0];
                  const f0t = n.features[0];
                  const f1q = result.queryNormalized[1];
                  const f1t = n.features[1];
                  const sq0 = (f0q - f0t) * (f0q - f0t);
                  const sq1 = (f1q - f1t) * (f1q - f1t);
                  return (
                    <div className="text-[11px] text-slate-600 space-y-1.5 font-mono">
                      <p>d = &radic;( (Q<sub>1</sub>-T<sub>1</sub>)&sup2; + (Q<sub>2</sub>-T<sub>2</sub>)&sup2; + ... + (Q<sub>13</sub>-T<sub>13</sub>)&sup2; )</p>
                      <p>d = &radic;( ({f0q.toFixed(4)} - {f0t.toFixed(4)})&sup2; + ({f1q.toFixed(4)} - {f1t.toFixed(4)})&sup2; + ... )</p>
                      <p>d = &radic;( ({(f0q - f0t).toFixed(4)})&sup2; + ({(f1q - f1t).toFixed(4)})&sup2; + ... )</p>
                      <p>d = &radic;( {sq0.toFixed(4)} + {sq1.toFixed(4)} + ... )</p>
                      <p>d = &radic;( ... )</p>
                      <p className="font-bold text-slate-900">d = {n.distance.toFixed(4)}</p>
                    </div>
                  );
                })()}
                <p className="text-[11px] text-slate-500 mt-2">
                  Lihat rincian lengkap per fitur dengan menekan tombol detail di bawah.
                </p>
              </div>

              {/* Detail per tetangga */}
              <div className="ml-8 space-y-3">
                {result.neighbors.map((n) => {
                  const perFeature = result.queryNormalized.map((qVal, featIdx) => {
                    const tVal = n.features[featIdx];
                    const diff = qVal - tVal;
                    return { feature: FEATURE_NAMES[featIdx], qVal, tVal, diff, sq: diff * diff };
                  });
                  const sumSq = perFeature.reduce((s, f) => s + f.sq, 0);
                  return (
                    <details key={n.rank} className="border border-slate-200 rounded-xl overflow-hidden">
                      <summary className="px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Tetangga #{n.rank} — {n.labelName}</span>
                        <span className="font-mono">d = &radic;{sumSq.toFixed(4)} = {n.distance.toFixed(4)}</span>
                      </summary>
                      <div className="p-4 overflow-x-auto">
                        <table className="w-full text-[11px]">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-1 px-2 font-bold text-slate-500">Fitur</th>
                              <th className="text-right py-1 px-2 font-bold text-slate-500">Q<sub>i</sub> (Query)</th>
                              <th className="text-right py-1 px-2 font-bold text-slate-500">T<sub>i</sub> (Tetangga)</th>
                              <th className="text-right py-1 px-2 font-bold text-slate-500">Q<sub>i</sub> - T<sub>i</sub></th>
                              <th className="text-right py-1 px-2 font-bold text-slate-500">(Q<sub>i</sub> - T<sub>i</sub>)&sup2;</th>
                            </tr>
                          </thead>
                          <tbody>
                            {perFeature.map((f, fi) => (
                              <tr key={fi} className="border-b border-slate-50">
                                <td className="py-1 px-2 text-slate-600">{f.feature}</td>
                                <td className="py-1 px-2 text-right font-mono text-slate-700">{f.qVal.toFixed(4)}</td>
                                <td className="py-1 px-2 text-right font-mono text-slate-700">{f.tVal.toFixed(4)}</td>
                                <td className="py-1 px-2 text-right font-mono text-slate-500">{f.diff.toFixed(4)}</td>
                                <td className="py-1 px-2 text-right font-mono text-slate-900 font-bold">{f.sq.toFixed(4)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-slate-300 font-bold">
                              <td colSpan={4} className="py-1.5 px-2 text-right text-slate-700">&Sigma;(Q<sub>i</sub> - T<sub>i</sub>)&sup2;</td>
                              <td className="py-1.5 px-2 text-right font-mono text-slate-900">{sumSq.toFixed(4)}</td>
                            </tr>
                            <tr className="font-bold">
                              <td colSpan={4} className="py-1.5 px-2 text-right text-slate-700">d = &radic;{sumSq.toFixed(4)}</td>
                              <td className="py-1.5 px-2 text-right font-mono text-slate-900 text-sm">{n.distance.toFixed(4)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>

            {/* ===== STEP 4: MAJORITY VOTING ===== */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">4</span>
                <h4 className="text-sm font-bold text-slate-900">Majority Voting (Pemungutan Suara Mayoritas)</h4>
              </div>

              {/* Rumus */}
              <div className="ml-8 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2">Rumus:</p>
                <div className="bg-white rounded-lg p-3 border border-slate-100 mb-3">
                  <code className="text-xs text-slate-800 font-mono block">
                    prediksi = argmax<sub>c</sub> ( jumlah_tetangga_kelas_c )
                  </code>
                  <code className="text-xs text-slate-800 font-mono block mt-1">
                    Confidence = jumlah_suara_kelas_pemenang / K
                  </code>
                </div>
                <p className="text-xs font-bold text-slate-700 mb-1">Keterangan simbol:</p>
                <div className="text-[11px] text-slate-600 space-y-0.5 mb-3">
                  <p><code className="bg-white px-1 rounded font-bold">argmax</code> = mencari nilai kelas (c) yang menghasilkan jumlah suara terbanyak</p>
                  <p><code className="bg-white px-1 rounded font-bold">c</code> = kelas/kategori (0 = Belum Tahu, 1 = Bukan ODHIV, 2 = ODHIV)</p>
                  <p><code className="bg-white px-1 rounded font-bold">jumlah_tetangga_kelas_c</code> = berapa banyak tetangga yang memiliki label kelas c</p>
                  <p><code className="bg-white px-1 rounded font-bold">K</code> = jumlah tetangga terdekat yang dipertimbangkan (parameter K)</p>
                  <p><code className="bg-white px-1 rounded font-bold">Confidence</code> = tingkat kepercayaan prediksi (0% s/d 100%)</p>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong>Cara kerja:</strong> Hitung berapa kali muncul setiap kelas di antara K tetangga terdekat.
                  Kelas dengan <strong>jumlah suara terbanyak</strong> menjadi hasil prediksi.
                  Jika terjadi <strong>tie</strong> (jumlah suara sama), maka dipilih kelas yang memiliki <strong>total jarak paling kecil</strong> dari query.
                </p>
              </div>

              {/* Voting Breakdown */}
              <div className="ml-8 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-3">Hasil Voting dari {result.kUsed} Tetangga Terdekat:</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  {result.neighbors.map((n) => (
                    <div key={n.rank} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                      n.label === result.predictedClass
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}>
                      #{n.rank} → <span className={`w-2 h-2 rounded-full ${n.label === 0 ? 'bg-green-400' : n.label === 1 ? 'bg-slate-400' : 'bg-red-400'}`} /> {n.labelName}
                    </div>
                  ))}
                </div>
                <div className="space-y-2 mb-4">
                  {Object.entries(result.votes).map(([cls, count]) => {
                    const pct = (count / result.kUsed) * 100;
                    const isWinner = Number(cls) === result.predictedClass;
                    return (
                      <div key={cls} className={`flex items-center gap-3 text-xs ${isWinner ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                        <span className="w-32">{CLASS_LABELS[Number(cls)]}</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isWinner ? 'bg-slate-900' : 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-24 text-right font-mono">{count} suara ({pct.toFixed(0)}%)</span>
                        {isWinner && <span className="text-[10px] px-2 py-0.5 bg-slate-900 text-white rounded-full font-bold">MENANG</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200 text-xs font-bold text-slate-900">
                  → Prediksi: {result.predictedLabel} ({result.votes[result.predictedClass]}/{result.kUsed} suara = {((result.votes[result.predictedClass] / result.kUsed) * 100).toFixed(0)}%)
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {user && (
            <div className="flex justify-center">
              {saved ? (
                <div className="flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl">
                  <Check className="w-4 h-4" /> Tersimpan di Riwayat
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan ke Riwayat
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons — hidden during processing */}
      {!processing && (
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-3 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Lanjut <ArrowRight className="w-4 h-4" />
          </button>
        ) : step === 3 ? (
          <button
            onClick={runPrediction}
            disabled={!trainingDataLoaded}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" /> Prediksi
          </button>
        ) : (
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            <Trash2 className="w-4 h-4" /> Prediksi Baru
          </button>
        )}
      </div>
      )}
    </div>
  );
}
