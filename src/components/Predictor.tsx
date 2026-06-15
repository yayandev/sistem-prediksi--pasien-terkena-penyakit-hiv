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

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addPrediction } from '../lib/firestore';
import { predict, loadTrainingData } from '../ml/runner';
import { ArrowLeft, ArrowRight, Zap, Check, AlertTriangle, Database, Save, Loader2, Trash2 } from 'lucide-react';

interface PredictionResult {
  predictedClass: number;
  predictedLabel: string;
  neighbors: Array<{ label: number; distance: number; rank: number }>;
  votes: Record<number, number>;
}

const CLASS_LABELS: Record<number, string> = {
  0: 'Bukan ODHIV',
  1: 'ODHIV',
  2: 'Belum Tahu',
};

const STEPS = [
  { id: 1, label: 'Identitas' },
  { id: 2, label: 'Riwayat Kesehatan' },
  { id: 3, label: 'Gaya Hidup' },
  { id: 4, label: 'Hasil' },
];

const GENDER_MAP: Record<string, number> = { 'Laki-laki': 1, 'Perempuan': 2 };
const BOOL_MAP: Record<string, number> = { 'Ya': 1, 'Tidak': 0 };

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

  useEffect(() => {
    async function init() {
      setLoadingTraining(true);
      await loadTrainingData();
      setTrainingDataLoaded(true);
      setLoadingTraining(false);
    }
    init();
  }, []);

  const set = (field: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  function toNums(f: FormData) {
    return {
      umur: Number(f.umur) || 0,
      jenis_kelamin: GENDER_MAP[f.jenis_kelamin] || 0,
      kelompok_populasi: Number(f.kelompok_populasi) || 0,
      alasan_kunjungan: Number(f.alasan_kunjungan) || 0,
      riwayat_tes_hiv: Number(f.riwayat_tes_hiv) || 0,
      riwayat_ims: Number(f.riwayat_ims) || 0,
      jumlah_pasangan_seksual: Number(f.jumlah_pasangan_seksual) || 0,
      penggunaan_kondom: BOOL_MAP[f.penggunaan_kondom] || 0,
      penggunaan_napza_suntik: BOOL_MAP[f.penggunaan_napza_suntik] || 0,
      status_pernikahan: Number(f.status_pernikahan) || 0,
      usia_pertama_hubungan: Number(f.usia_pertama_hubungan) || 0,
      terapi_arv: BOOL_MAP[f.terapi_arv] || 0,
      gejala_klinis: Number(f.gejala_klinis) || 0,
    };
  }

  function runPrediction() {
    setError('');
    const nums = toNums(form);
    if (!form.umur || !form.jenis_kelamin) {
      setError('Umur dan Jenis Kelamin wajib diisi');
      return;
    }
    try {
      const pred = predict(nums);
      setResult(pred);
      setStep(4);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menjalankan prediksi');
    }
  }

  async function handleSave() {
    if (!result || !user) return;
    setSaving(true);
    try {
      await addPrediction({
        patientId: '',
        nama: form.nama || 'Tanpa Nama',
        ...toNums(form),
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
                <option value="1">Belum Kawin</option>
                <option value="2">Kawin</option>
                <option value="3">Cerai</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Kelompok Populasi</label>
              <select value={form.kelompok_populasi} onChange={(e) => set('kelompok_populasi', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option value="0">Umum</option>
                <option value="1">Waria</option>
                <option value="2">ODHA</option>
                <option value="3">Ibu Hamil</option>
                <option value="4">WBP</option>
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
                <option value="0">Belum pernah</option>
                <option value="1">Pernah (negatif)</option>
                <option value="2">Pernah (positif)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Riwayat IMS</label>
              <select value={form.riwayat_ims} onChange={(e) => set('riwayat_ims', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                <option value="">Pilih</option>
                <option value="0">Tidak ada</option>
                <option value="1">Pernah</option>
                <option value="2">Sedang terjadi</option>
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
                <option value="0">Tidak ada gejala</option>
                <option value="1">Gejala ringan</option>
                <option value="2">Gejala sedang</option>
                <option value="3">Gejala berat</option>
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
                <option value="0">Konseling</option>
                <option value="1">Tes sukarela</option>
                <option value="2">Kontak serumah</option>
                <option value="3">Rujukan klinis</option>
                <option value="4">IMS</option>
                <option value="5">Ibu hamil</option>
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
              <input type="number" value={form.usia_pertama_hubungan} onChange={(e) => set('usia_pertama_hubungan', e.target.value)} placeholder="10-30" className="w-full px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors" />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Hasil */}
      {step === 4 && result && (
        <div className="space-y-6">
          {/* Prediction Result */}
          <div className="bg-white border-2 border-slate-900 p-6 sm:p-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-6">Hasil Prediksi</h3>
            <div className="flex items-center gap-4 mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
                result.predictedClass === 1 ? 'bg-red-100 text-red-700 border border-red-200' :
                result.predictedClass === 2 ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                'bg-green-100 text-green-700 border border-green-200'
              }`}>
                K{result.predictedClass}
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-semibold mb-1">Prediksi</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900">{result.predictedLabel}</p>
              </div>
            </div>

            {/* Vote Details */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {Object.entries(result.votes).map(([k, v]) => {
                const label = CLASS_LABELS[Number(k)];
                const isWinner = Number(k) === result.predictedClass;
                return (
                  <div key={k} className={`p-3 rounded-xl border-2 text-center transition-all ${isWinner ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>
                    <p className={`text-[10px] font-bold uppercase mb-1 ${isWinner ? 'text-white/60' : 'text-slate-400'}`}>K{k}</p>
                    <p className={`text-xl font-black ${isWinner ? 'text-white' : 'text-slate-700'}`}>{v}</p>
                    <p className={`text-[10px] mt-0.5 ${isWinner ? 'text-white/70' : 'text-slate-500'}`}>{label}</p>
                  </div>
                );
              })}
            </div>

            {/* Neighbor Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-bold text-slate-500 uppercase">Rank</th>
                    <th className="text-left py-2 px-3 font-bold text-slate-500 uppercase">Label</th>
                    <th className="text-left py-2 px-3 font-bold text-slate-500 uppercase">Jarak</th>
                  </tr>
                </thead>
                <tbody>
                  {result.neighbors.map((n) => (
                    <tr key={n.rank} className="border-b border-slate-100">
                      <td className="py-2 px-3 font-semibold text-slate-700">#{n.rank}</td>
                      <td className="py-2 px-3 font-semibold text-slate-700">{CLASS_LABELS[n.label]}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{n.distance.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Navigation Buttons */}
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
    </div>
  );
}
