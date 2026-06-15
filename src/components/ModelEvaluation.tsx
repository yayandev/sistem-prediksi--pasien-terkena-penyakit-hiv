/**
 * ModelEvaluation.tsx
 * ===================
 * Komponen "Evaluasi Model" — menampilkan SELURUH pipeline preprocessing
 * dan evaluasi model KNN dari scratch, LENGKAP dengan penjelasan kode program.
 *
 * Setiap tahap sekarang punya:
 *   - Alur tahapan (Input → Proses → Output)
 *   - Penjelasan (MENGAPA)
 *   - Tabel/visual data
 *   - Kode program dari utils/*.ts (collapsible)
 */

import React, { useState, useMemo } from 'react';
import { runFullPreprocessing } from '../utils/preprocessing';
import { trainTestSplit } from '../utils/splitting';
import { evaluateModel } from '../utils/evaluation';
import { findOptimalK } from '../utils/validation';
import { smoteAllClasses } from '../utils/sMOTE';
import { getBounds, normalizeDataset, getLabels } from '../utils/normalization';
import { correlationMatrix } from '../utils/correlation';
import rawDataset from '../data/raw_hiv_dataset.json';
import { Table2, Target, TrendingUp, BarChart3, Layers, ChevronDown, ChevronUp, Code } from 'lucide-react';

/* ================================================================
   CodeBlock — komponen reusable untuk menampilkan blok kode
   ================================================================ */
function CodeBlock({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="bg-slate-900 overflow-hidden">
          <div className="p-4 sm:p-5 text-slate-300 text-[11px] sm:text-[12px] font-mono leading-loose overflow-x-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Section — wrapper collapsible
   ================================================================ */
function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border-2 border-slate-900">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 px-6 py-4 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <Icon className="text-white w-5 h-5" />
          <h2 className="text-lg font-medium text-white tracking-widest uppercase text-left">{title}</h2>
        </div>
        {isOpen ? <ChevronUp className="text-white w-5 h-5" /> : <ChevronDown className="text-white w-5 h-5" />}
      </button>
      {isOpen && <div className="p-6 space-y-4">{children}</div>}
    </div>
  );
}

/* ================================================================
   Komponen Utama
   ================================================================ */
export default function ModelEvaluation() {
  const [selectedK, setSelectedK] = useState<number>(3);

  // Pipeline
  const preprocessing = useMemo(() => runFullPreprocessing(rawDataset), []);
  const split = useMemo(() => trainTestSplit(preprocessing.encodedData, 0.2, 42), [preprocessing.encodedData]);
  const smoteTraining = useMemo(() => smoteAllClasses(split.train, 3, 42), [split.train]);
  const normalization = useMemo(() => {
    const bounds = getBounds(smoteTraining);
    return { bounds, normalizedTrain: normalizeDataset(smoteTraining, bounds), normalizedTest: normalizeDataset(split.test, bounds) };
  }, [smoteTraining, split.test]);

  // Evaluasi
  const evaluation = useMemo(() => evaluateModel(preprocessing.encodedData, selectedK, 42), [preprocessing.encodedData, selectedK]);
  const kOptimization = useMemo(() => findOptimalK(preprocessing.encodedData, 15, 5, 42), [preprocessing.encodedData]);
  const correlations = useMemo(() => correlationMatrix(preprocessing.encodedData), [preprocessing.encodedData]);

  const classNames = ['Belum Tahu', 'Bukan ODHIV', 'ODHIV'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 sm:pb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight uppercase">Evaluasi Model KNN</h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Lihat gimana 200 data record dengan 13 fitur diproses dari awal sampai akhir — dari data mentah sampai jadi prediksi. Setiap tahap dijelaskan beserta kode programnya.
        </p>
      </div>

      {/* ============================================================ */}
      {/* TAHAP 1: DATA CLEANING */}
      {/* ============================================================ */}
      <Section title="Tahap 1 — Data Cleaning" icon={Layers} defaultOpen={true}>
        {/* Alur */}
        <div className="p-4 bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Alur Tahapan:</h3>
          <div className="text-xs text-slate-700 space-y-1">
            <p><strong>Input:</strong> {preprocessing.report.rawCount} baris data mentah — 13 fitur + 1 target, masih teks, ada yang null.</p>
            <p><strong>Proses:</strong> Cek tiap baris. Kalau ada satupun kolom yang kosong, buang seluruh barisnya.</p>
            <p><strong>Output:</strong> {preprocessing.report.cleanedCount} baris bersih, 13 fitur terisi lengkap.</p>
          </div>
        </div>

        {/* Kenapa */}
        <div className="p-4 bg-white border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Kenapa harus dibuang?</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• <strong>{preprocessing.report.removedRows} baris dibuang</strong> — punya null di kolom "kelompok_populasi".</li>
            <li>• <strong>KNN nggak bisa kerja dengan data kosong</strong> — Euclidean Distance butuh semua fitur terisi.</li>
            <li>• <strong>Sama kayak jurnal (hal. 128):</strong> "kolom Kelompok Populasi memiliki 5 data yang hilang."</li>
          </ul>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Contoh Data Setelah Dibersihkan:</h4>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left border border-slate-300">Umur</th>
                <th className="p-2 text-left border border-slate-300">JK</th>
                <th className="p-2 text-left border border-slate-300">Kel. Pop</th>
                <th className="p-2 text-left border border-slate-300">Alasan</th>
                <th className="p-2 text-left border border-slate-300">R. Tes</th>
                <th className="p-2 text-left border border-slate-300">R. IMS</th>
                <th className="p-2 text-left border border-slate-300">Pasangan</th>
                <th className="p-2 text-left border border-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {preprocessing.cleanedData.slice(0, 3).map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-2 border border-slate-300 font-mono">{row.umur}</td>
                  <td className="p-2 border border-slate-300">{row.jenis_kelamin}</td>
                  <td className="p-2 border border-slate-300">{row.kelompok_populasi}</td>
                  <td className="p-2 border border-slate-300">{row.alasan_kunjungan}</td>
                  <td className="p-2 border border-slate-300">{row.riwayat_tes_hiv}</td>
                  <td className="p-2 border border-slate-300">{row.riwayat_ims}</td>
                  <td className="p-2 border border-slate-300">{row.jumlah_pasangan_seksual}</td>
                  <td className="p-2 border border-slate-300">{row.status_odhiv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Kode */}
        <CodeBlock title="📄 Lihat Kode — preprocessing.ts → cleanData()">
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">cleanData</span>(rawData: <span className="text-teal-300">RawDatasetRow</span>[]): <span className="text-teal-300">RawDatasetRow</span>[] {'{'}</div>
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// Filter: hanya ambil baris yang TIDAK memiliki null di SEMUA field'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> rawData.<span className="text-blue-400">filter</span>((row) =&gt; {'{'}</div>
          <div className="whitespace-pre">    <span className="text-pink-400">return</span> (</div>
          <div className="whitespace-pre">      row.umur !== <span className="text-orange-300">null</span> &&</div>
          <div className="whitespace-pre">      row.jenis_kelamin !== <span className="text-orange-300">null</span> &&</div>
          <div className="whitespace-pre">      row.kelompok_populasi !== <span className="text-orange-300">null</span> &&</div>
          <div className="whitespace-pre">      row.alasan_kunjungan !== <span className="text-orange-300">null</span> &&</div>
          <div className="whitespace-pre">      row.status_odhiv !== <span className="text-orange-300">null</span></div>
          <div className="whitespace-pre">    );</div>
          <div className="whitespace-pre">  {'}'});</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700 pt-3">
            <strong className="text-white">Penjelasan:</strong> Pakai <code className="text-blue-300">Array.filter()</code> — baris yang punya null di kolom manapun otomatis dibuang. Sederhana tapi efektif.
          </div>
        </CodeBlock>
      </Section>

      {/* ============================================================ */}
      {/* TAHAP 2: LABEL ENCODER */}
      {/* ============================================================ */}
      <Section title="Tahap 2 — Label Encoder" icon={Layers}>
        <div className="p-4 bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Alur Tahapan:</h3>
          <div className="text-xs text-slate-700 space-y-1">
            <p><strong>Input:</strong> {preprocessing.report.cleanedCount} baris bersih, 13 fitur — masih teks.</p>
            <p><strong>Proses:</strong> Kumpulkan nilai unik per kolom → urutkan alfabet → kasih angka 0, 1, 2, dst.</p>
            <p><strong>Output:</strong> Semua teks udah jadi angka (14 kolom numerik).</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Kenapa harus diubah ke angka?</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• <strong>KNN kerjanya pakai angka</strong> — Euclidean Distance nggak bisa ngitung jarak antara "Laki-laki" dan "Perempuan".</li>
            <li>• <strong>LabelEncoder urutkan alfabet</strong> → Laki-laki=0, Perempuan=1.</li>
            <li>• <strong>Sama kayak jurnal (hal. 129):</strong> "LabelEncoder berfungsi untuk mengubah setiap nilai dalam kolom menjadi angka berurutan."</li>
          </ul>
        </div>

        {/* Mapping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(preprocessing.encodingMaps).map(([kolom, mapping]) => (
            <div key={kolom} className="border border-slate-200">
              <div className="bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 uppercase">{kolom}</div>
              <div className="p-3">
                {Object.entries(mapping).map(([str, num]) => (
                  <div key={str} className="flex justify-between text-xs py-1">
                    <span className="text-slate-700">{str}</span>
                    <span className="font-mono font-bold text-slate-900">= {num}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Contoh Data Sesudah Encoding:</h4>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left border border-slate-300">Umur</th>
                <th className="p-2 text-left border border-slate-300">JK</th>
                <th className="p-2 text-left border border-slate-300">Kel. Pop</th>
                <th className="p-2 text-left border border-slate-300">Alasan</th>
                <th className="p-2 text-left border border-slate-300">R. Tes</th>
                <th className="p-2 text-left border border-slate-300">R. IMS</th>
                <th className="p-2 text-left border border-slate-300">Pasangan</th>
                <th className="p-2 text-left border border-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {preprocessing.encodedData.slice(0, 3).map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-2 border border-slate-300 font-mono">{row.umur}</td>
                  <td className="p-2 border border-slate-300 font-mono">{row.jenis_kelamin}</td>
                  <td className="p-2 border border-slate-300 font-mono">{row.kelompok_populasi}</td>
                  <td className="p-2 border border-slate-300 font-mono">{row.alasan_kunjungan}</td>
                  <td className="p-2 border border-slate-300 font-mono">{row.riwayat_tes_hiv}</td>
                  <td className="p-2 border border-slate-300 font-mono">{row.riwayat_ims}</td>
                  <td className="p-2 border border-slate-300 font-mono">{row.jumlah_pasangan_seksual}</td>
                  <td className="p-2 border border-slate-300 font-mono">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Kode */}
        <CodeBlock title="📄 Lihat Kode — preprocessing.ts → labelEncode()">
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">labelEncode</span>(cleanedData: <span className="text-teal-300">RawDatasetRow</span>[]) {'{'}</div>
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// 1. Kumpulkan semua nilai unik per kolom, lalu urutkan'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> uniqueJK = [...<span className="text-pink-400">new</span> <span className="text-blue-400">Set</span>(cleanedData.<span className="text-blue-400">map</span>(r =&gt; r.jenis_kelamin!))].<span className="text-blue-400">sort</span>();</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> uniqueKP = [...<span className="text-pink-400">new</span> <span className="text-blue-400">Set</span>(cleanedData.<span className="text-blue-400">map</span>(r =&gt; r.kelompok_populasi!))].<span className="text-blue-400">sort</span>();</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> uniqueAK = [...<span className="text-pink-400">new</span> <span className="text-blue-400">Set</span>(cleanedData.<span className="text-blue-400">map</span>(r =&gt; r.alasan_kunjungan!))].<span className="text-blue-400">sort</span>();</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> uniqueStatus = [...<span className="text-pink-400">new</span> <span className="text-blue-400">Set</span>(cleanedData.<span className="text-blue-400">map</span>(r =&gt; r.status_odhiv!))].<span className="text-blue-400">sort</span>();</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// 2. Buat mapping: string → angka (berurutan)'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> maps = {'{'} jenis_kelamin: {'{}'}, kelompok_populasi: {'{}'}, alasan_kunjungan: {'{}'}, status_odhiv: {'{}'} {'}'};</div>
          <div className="whitespace-pre">  uniqueJK.<span className="text-blue-400">forEach</span>((val, idx) =&gt; maps.jenis_kelamin[val] = idx);</div>
          <div className="whitespace-pre">  uniqueKP.<span className="text-blue-400">forEach</span>((val, idx) =&gt; maps.kelompok_populasi[val] = idx);</div>
          <div className="whitespace-pre">  uniqueAK.<span className="text-blue-400">forEach</span>((val, idx) =&gt; maps.alasan_kunjungan[val] = idx);</div>
          <div className="whitespace-pre">  uniqueStatus.<span className="text-blue-400">forEach</span>((val, idx) =&gt; maps.status_odhiv[val] = idx);</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// 3. Konversi setiap baris dari string ke angka'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> encoded = cleanedData.<span className="text-blue-400">map</span>((row) =&gt; ({'{'}</div>
          <div className="whitespace-pre">    umur: row.umur!,</div>
          <div className="whitespace-pre">    jenis_kelamin: maps.jenis_kelamin[row.jenis_kelamin!],</div>
          <div className="whitespace-pre">    kelompok_populasi: maps.kelompok_populasi[row.kelompok_populasi!],</div>
          <div className="whitespace-pre">    alasan_kunjungan: maps.alasan_kunjungan[row.alasan_kunjungan!],</div>
          <div className="whitespace-pre">    status: maps.status_odhiv[row.status_odhiv!],</div>
          <div className="whitespace-pre">  {'}'}));</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> {'{'} encoded, maps {'}'};</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700 pt-3">
            <strong className="text-white">Penjelasan:</strong> <code className="text-blue-300">Set</code> mengambil nilai unik, <code className="text-blue-300">sort()</code> mengurutkan alfabet, lalu <code className="text-blue-300">forEach((val, idx))</code> mengassign angka berurutan sesuai index.
          </div>
        </CodeBlock>
      </Section>

      {/* ============================================================ */}
      {/* TAHAP 3: SPLITTING DATA */}
      {/* ============================================================ */}
      <Section title="Tahap 3 — Splitting Data (80/20)" icon={Layers}>
        <div className="p-4 bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Alur Tahapan:</h3>
          <div className="text-xs text-slate-700 space-y-1">
            <p><strong>Input:</strong> {preprocessing.encodedData.length} data udah jadi angka (14 kolom: 13 fitur + 1 target).</p>
            <p><strong>Proses:</strong> Acak pakai Fisher-Yates Shuffle (seed=42) → 80% training, 20% testing.</p>
            <p><strong>Output:</strong> Training = {split.train.length} data, Testing = {split.test.length} data.</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Kenapa harus dipisah?</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• <strong>Data testing nggak boleh dipake saat training</strong> — kalau iya, model cuma "menghafal" (data leakage).</li>
            <li>• <strong>Seed=42</strong> biar tiap kali dijalankan, hasil split-nya selalu sama.</li>
          </ul>
        </div>

        {/* Visualisasi */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-slate-200">
            <div className="text-xs font-semibold text-slate-900 uppercase mb-2">Training (80%)</div>
            <div className="h-8 bg-slate-900 w-[80%] flex items-center justify-center">
              <span className="text-white text-xs font-mono">{split.train.length} data</span>
            </div>
          </div>
          <div className="p-4 border border-slate-200">
            <div className="text-xs font-semibold text-slate-900 uppercase mb-2">Testing (20%)</div>
            <div className="h-8 bg-slate-400 w-[20%] flex items-center justify-center">
              <span className="text-white text-xs font-mono">{split.test.length} data</span>
            </div>
          </div>
        </div>

        {/* Distribusi kelas */}
        <div className="overflow-x-auto">
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Distribusi Kelas per Split:</h4>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left border border-slate-300">Kelas</th>
                <th className="p-2 text-center border border-slate-300">Training</th>
                <th className="p-2 text-center border border-slate-300">Testing</th>
              </tr>
            </thead>
            <tbody>
              {classNames.map((name, i) => {
                const trainCount = split.train.filter(r => r.status === i).length;
                const testCount = split.test.filter(r => r.status === i).length;
                return (
                  <tr key={i}>
                    <td className="p-2 border border-slate-300 font-semibold">{name}</td>
                    <td className="p-2 text-center border border-slate-300 font-mono">{trainCount}</td>
                    <td className="p-2 text-center border border-slate-300 font-mono">{testCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Kode */}
        <CodeBlock title="📄 Lihat Kode — splitting.ts → trainTestSplit() + fisherYatesShuffle()">
          <div className="whitespace-pre"><span className="text-slate-500 italic">{'// Fisher-Yates Shuffle — mengacak array secara in-place O(n)'}</span></div>
          <div className="whitespace-pre"><span className="text-pink-400">function</span> <span className="text-blue-400">fisherYatesShuffle</span>&lt;<span className="text-teal-300">T</span>&gt;(array: <span className="text-teal-300">T</span>[], random: () =&gt; <span className="text-teal-300">number</span>): <span className="text-teal-300">void</span> {'{'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> i = array.length - <span className="text-orange-300">1</span>; i {'>'} <span className="text-orange-300">0</span>; i--) {'{'}</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> j = Math.<span className="text-blue-400">floor</span>(random() * (i + <span className="text-orange-300">1</span>));</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> temp = array[i];</div>
          <div className="whitespace-pre">    array[i] = array[j];</div>
          <div className="whitespace-pre">    array[j] = temp;</div>
          <div className="whitespace-pre">  {'}'}</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre"><span className="text-slate-500 italic">{'// Train/Test Split — bagi 80% training, 20% testing'}</span></div>
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">trainTestSplit</span>(dataset, testSize = <span className="text-orange-300">0.2</span>, seed = <span className="text-orange-300">42</span>) {'{'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> shuffled = [...dataset]; <span className="text-slate-500 italic">{'// salinan, jangan mutasi asli'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> random = <span className="text-blue-400">createSeededRandom</span>(seed);</div>
          <div className="whitespace-pre">  <span className="text-blue-400">fisherYatesShuffle</span>(shuffled, random);</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// splitIndex = floor(n × 0.8) untuk data training'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> splitIndex = Math.<span className="text-blue-400">floor</span>(shuffled.length * (<span className="text-orange-300">1</span> - testSize));</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> train = shuffled.<span className="text-blue-400">slice</span>(<span className="text-orange-300">0</span>, splitIndex);</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> test = shuffled.<span className="text-blue-400">slice</span>(splitIndex);</div>
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> {'{'} train, test {'}'};</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700 pt-3">
            <strong className="text-white">Penjelasan:</strong> <code className="text-blue-300">Fisher-Yates Shuffle</code> mengacak dari belakang ke depan. <code className="text-blue-300">createSeededRandom(42)</code> pakai Linear Congruential Generator biar hasilnya reproducible.
          </div>
        </CodeBlock>
      </Section>

      {/* ============================================================ */}
      {/* TAHAP 4: SMOTE */}
      {/* ============================================================ */}
      <Section title="Tahap 4 — SMOTE (Seimbangkan Kelas)" icon={Layers}>
        <div className="p-4 bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Alur Tahapan:</h3>
          <div className="text-xs text-slate-700 space-y-1">
            <p><strong>Input:</strong> Data training ({split.train.length} data) — kelasnya timpang.</p>
            <p><strong>Proses:</strong> Kelas minoritas → cari tetangga → bikin data baru di antara mereka.</p>
            <p><strong>Output:</strong> Data training seimbang ({smoteTraining.length} data).</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Kenapa harus diseimbangkan?</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• <strong>Sebelum SMOTE:</strong> Kelas "Belum Tahu" cuma 1-2 data → KNN bakal bias ke kelas mayoritas.</li>
            <li>• <strong>SMOTE bikin data SINTETIS</strong> (bukan duplikat!) dengan interpolasi linear.</li>
            <li>• <strong>Sesudah SMOTE:</strong> Semua kelas jumlahnya sama → KNN belajar adil.</li>
          </ul>
        </div>

        {/* Visualisasi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-900 uppercase mb-3">Sebelum SMOTE</h4>
            <div className="space-y-2">
              {classNames.map((name, i) => {
                const count = split.train.filter(r => r.status === i).length;
                const maxCount = Math.max(...classNames.map((_, j) => split.train.filter(r => r.status === j).length));
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono w-20 text-right text-slate-600">{name}</span>
                    <div className="flex-1 bg-slate-100 h-4 relative">
                      <div className="bg-red-300 h-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                      <span className="absolute right-1 top-0 h-4 flex items-center text-[10px] font-mono text-slate-700">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4 border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-900 uppercase mb-3">Sesudah SMOTE</h4>
            <div className="space-y-2">
              {classNames.map((name, i) => {
                const count = smoteTraining.filter(r => r.status === i).length;
                const maxCount = Math.max(...classNames.map((_, j) => smoteTraining.filter(r => r.status === j).length));
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono w-20 text-right text-slate-600">{name}</span>
                    <div className="flex-1 bg-slate-100 h-4 relative">
                      <div className="bg-slate-900 h-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                      <span className="absolute right-1 top-0 h-4 flex items-center text-[10px] font-mono text-white">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kode */}
        <CodeBlock title="📄 Lihat Kode — sMOTE.ts → smote() + interpolateLinear()">
          <div className="whitespace-pre"><span className="text-slate-500 italic">{'// Interpolasi linear: x_new = x_i + alpha × (x_nn - x_i)'}</span></div>
          <div className="whitespace-pre"><span className="text-pink-400">function</span> <span className="text-blue-400">interpolateLinear</span>(point1: <span className="text-teal-300">number</span>[], point2: <span className="text-teal-300">number</span>[], random: () =&gt; <span className="text-teal-300">number</span>) {'{'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> alpha = random(); <span className="text-slate-500 italic">{'// angka acak 0-1'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> point1.<span className="text-blue-400">map</span>((v, i) =&gt; v + alpha * (point2[i] - v));</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre"><span className="text-slate-500 italic">{'// SMOTE utama: untuk setiap kelas minoritas'}</span></div>
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">smote</span>(dataset, targetClass, kNeighbors = <span className="text-orange-300">3</span>, seed = <span className="text-orange-300">42</span>) {'{'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> random = <span className="text-blue-400">createSeededRandom</span>(seed);</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// 1. Pisahkan data berdasarkan kelas'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> sameClass = dataset.<span className="text-blue-400">filter</span>(r =&gt; r.status === targetClass);</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// 2. Generate sampel sintetis'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> i = <span className="text-orange-300">0</span>; i {'<'} samplesToGenerate; i++) {'{'}</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> sample = sameClass[randomIndex];</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> neighbors = <span className="text-blue-400">findKNearestSameClass</span>(sample, sameClass, kNeighbors);</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> neighbor = neighbors[randomNeighborIndex];</div>
          <div className="whitespace-pre">    <span className="text-slate-500 italic">{'// 3. Interpolasi linear'}</span></div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> synthetic = <span className="text-blue-400">interpolateLinear</span>(sample, neighbor, random);</div>
          <div className="whitespace-pre">  {'}'}</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> [...dataset, ...syntheticSamples]; <span className="text-slate-500 italic">{'// gabung asli + sintetis'}</span></div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700 pt-3">
            <strong className="text-white">Penjelasan:</strong> Data sintetis dibuat di "garis" antara data asli dan tetangganya. <code className="text-blue-300">alpha</code> yang random menentukan posisi di garis tersebut. Fitur diskrit di-<code className="text-blue-300">Math.round()</code> karena hanya boleh integer.
          </div>
        </CodeBlock>
      </Section>

      {/* ============================================================ */}
      {/* TAHAP 5: NORMALISASI */}
      {/* ============================================================ */}
      <Section title="Tahap 5 — Normalisasi (Min-Max)" icon={Layers}>
        <div className="p-4 bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Alur Tahapan:</h3>
          <div className="text-xs text-slate-700 space-y-1">
            <p><strong>Input:</strong> Data training seimbang ({smoteTraining.length} data).</p>
            <p><strong>Proses:</strong> Cari min/max tiap fitur → pakai rumus (x - min) / (max - min).</p>
            <p><strong>Output:</strong> Semua fitur nilainya antara 0 dan 1.</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Kenapa harus dinormalisasi?</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• <strong>Tanpa normalisasi:</strong> Usia (21-62) dan jumlah pasangan (1-10) mendominasi jarak dibanding fitur biner (0-1).</li>
            <li>• <strong>Min-Max bikin semua fitur setara</strong> — range-nya sama-sama 0 sampai 1.</li>
          </ul>
        </div>

        {/* Bounds */}
        <div className="p-4 border border-slate-200">
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Bounds (Min/Max per Fitur):</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left border border-slate-300">Fitur</th>
                  <th className="p-2 text-center border border-slate-300">Min</th>
                  <th className="p-2 text-center border border-slate-300">Max</th>
                  <th className="p-2 text-center border border-slate-300">Range</th>
                </tr>
              </thead>
              <tbody>
                {['umur', 'jenis_kelamin', 'kelompok_populasi', 'alasan_kunjungan', 'riwayat_tes_hiv', 'riwayat_ims', 'jumlah_pasangan_seksual', 'penggunaan_kondom', 'penggunaan_napza_suntik', 'status_pernikahan', 'usia_pertama_hubungan', 'terapi_arv', 'gejala_klinis'].map((fitur, i) => (
                  <tr key={i}>
                    <td className="p-2 border border-slate-300 font-semibold">{fitur}</td>
                    <td className="p-2 text-center border border-slate-300 font-mono">{normalization.bounds.min[i]}</td>
                    <td className="p-2 text-center border border-slate-300 font-mono">{normalization.bounds.max[i]}</td>
                    <td className="p-2 text-center border border-slate-300 font-mono">{normalization.bounds.max[i] - normalization.bounds.min[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kode */}
        <CodeBlock title="📄 Lihat Kode — normalization.ts → getBounds() + normalizeFeatureArray()">
          <div className="whitespace-pre"><span className="text-slate-500 italic">{'// Hitung min dan max untuk setiap fitur'}</span></div>
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">getBounds</span>(dataset: <span className="text-teal-300">DatasetRow</span>[]): <span className="text-teal-300">Bounds</span> {'{'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> min = [dataset[<span className="text-orange-300">0</span>].umur, dataset[<span className="text-orange-300">0</span>].jenis_kelamin, ...];</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> max = [...min];</div>
          <div className="whitespace-pre">  <span className="text-pink-400">for</span> (<span className="text-pink-400">const</span> row <span className="text-pink-400">of</span> dataset) {'{'}</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> features = [row.umur, row.jenis_kelamin, ...];</div>
          <div className="whitespace-pre">    <span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> i = <span className="text-orange-300">0</span>; i {'<'} features.length; i++) {'{'}</div>
          <div className="whitespace-pre">      <span className="text-pink-400">if</span> (features[i] {'<'} min[i]) min[i] = features[i];</div>
          <div className="whitespace-pre">      <span className="text-pink-400">if</span> (features[i] {'>'} max[i]) max[i] = features[i];</div>
          <div className="whitespace-pre">    {'}'}</div>
          <div className="whitespace-pre">  {'}'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> {'{'} min, max {'}'};</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre"><span className="text-slate-500 italic">{'// Normalisasi satu vektor fitur'}</span></div>
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">normalizeFeatureArray</span>(features: <span className="text-teal-300">number</span>[], bounds: <span className="text-teal-300">Bounds</span>) {'{'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> features.<span className="text-blue-400">map</span>((val, i) =&gt; {'{'}</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> range = bounds.max[i] - bounds.min[i];</div>
          <div className="whitespace-pre">    <span className="text-pink-400">if</span> (range === <span className="text-orange-300">0</span>) <span className="text-pink-400">return</span> <span className="text-orange-300">0</span>; <span className="text-slate-500 italic">{'// hindari /0'}</span></div>
          <div className="whitespace-pre">    <span className="text-pink-400">return</span> (val - bounds.min[i]) / range;</div>
          <div className="whitespace-pre">  {'}'});</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700 pt-3">
            <strong className="text-white">Penjelasan:</strong> Rumus Min-Max: <code className="text-blue-300">(x - min) / (max - min)</code>. Kalau x=min → 0, x=max → 1. Kasus <code className="text-blue-300">range === 0</code> ditangani supaya tidak division by zero.
          </div>
        </CodeBlock>
      </Section>

      {/* ============================================================ */}
      {/* ALGORITMA KNN */}
      {/* ============================================================ */}
      <Section title="Algoritma KNN — Inti Sistem" icon={Target}>
        <div className="p-4 bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Alur KNN:</h3>
          <div className="text-xs text-slate-700 space-y-1">
            <p><strong>Input:</strong> Data training (sudah dinormalisasi) + label + data query baru + nilai K.</p>
            <p><strong>Proses:</strong> Hitung jarak → urutkan → ambil K terdekat → voting mayoritas.</p>
            <p><strong>Output:</strong> Label prediksi (0, 1, atau 2).</p>
          </div>
        </div>

        {/* Kode */}
        <CodeBlock title="📄 Lihat Kode — knn.ts → knnPredictWithDetails()" defaultOpen={true}>
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">knnPredictWithDetails</span>(trainingX, trainingY, query, k) {'{'}</div>
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// 1. Hitung jarak Euclidean dari query ke SEMUA data training'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> distances = trainingX.<span className="text-blue-400">map</span>((features, index) =&gt; ({'{'}</div>
          <div className="whitespace-pre">    index, features, label: trainingY[index],</div>
          <div className="whitespace-pre">    distance: <span className="text-blue-400">euclideanDistance</span>(query, features),</div>
          <div className="whitespace-pre">  {'}'}));</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// 2. Urutkan berdasarkan jarak terkecil (ascending)'}</span></div>
          <div className="whitespace-pre">  distances.<span className="text-blue-400">sort</span>((a, b) =&gt; a.distance - b.distance);</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// 3. Ambil K tetangga terdekat'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> neighbors = distances.<span className="text-blue-400">slice</span>(<span className="text-orange-300">0</span>, k);</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// 4. Majority Voting'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> voting = {'{}'};</div>
          <div className="whitespace-pre">  neighbors.<span className="text-blue-400">forEach</span>(n =&gt; voting[n.label] = (voting[n.label] || <span className="text-orange-300">0</span>) + <span className="text-orange-300">1</span>);</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// 5. Return kelas dengan suara terbanyak (+ tie-breaking)'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> Object.<span className="text-blue-400">entries</span>(voting)</div>
          <div className="whitespace-pre">    .<span className="text-blue-400">sort</span>((a, b) =&gt; b[<span className="text-orange-300">1</span>] - a[<span className="text-orange-300">1</span>])[<span className="text-orange-300">0</span>][<span className="text-orange-300">0</span>];</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700 pt-3">
            <strong className="text-white">Penjelasan:</strong> Jarak dihitung pakai <code className="text-blue-300">euclideanDistance()</code> dari distance.ts. Voting pakai object <code className="text-blue-300">Record&lt;number, number&gt;</code>. Tie-breaking: kalau suara sama, pilih yang total jaraknya lebih kecil.
          </div>
        </CodeBlock>

        <CodeBlock title="📄 Lihat Kode — distance.ts → euclideanDistance()">
          <div className="whitespace-pre"><span className="text-slate-500 italic">{'// Rumus: d(x,y) = √( Σ(xi - yi)² )'}</span></div>
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">euclideanDistance</span>(a: <span className="text-teal-300">number</span>[], b: <span className="text-teal-300">number</span>[]): <span className="text-teal-300">number</span> {'{'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">let</span> sum = <span className="text-orange-300">0</span>;</div>
          <div className="whitespace-pre">  <span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> i = <span className="text-orange-300">0</span>; i {'<'} a.length; i++) {'{'}</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> diff = a[i] - b[i];</div>
          <div className="whitespace-pre">    sum += diff * diff; <span className="text-slate-500 italic">{'// (xi - yi)²'}</span></div>
          <div className="whitespace-pre">  {'}'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> Math.<span className="text-blue-400">sqrt</span>(sum);</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700 pt-3">
            <strong className="text-white">Penjelasan:</strong> Iterasi tiap dimensi, hitung selisih, kuadratkan, jumlahkan, lalu akar kuadrat. Makin kecil hasilnya, makin mirip dua titik.
          </div>
        </CodeBlock>
      </Section>

      {/* ============================================================ */}
      {/* CONFUSION MATRIX */}
      {/* ============================================================ */}
      <Section title="Confusion Matrix" icon={Table2} defaultOpen={true}>
        <p className="text-sm text-slate-600">
          Tabel 3×3 yang nunjukin berapa banyak prediksi yang benar dan salah buat tiap kelas.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 text-left font-semibold text-slate-900 border border-slate-300">Asli ↓ / Prediksi →</th>
                {classNames.map((name, i) => (
                  <th key={i} className="p-3 text-center font-semibold text-slate-900 border border-slate-300">{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evaluation.confusionMatrix.map((row, i) => (
                <tr key={i}>
                  <td className="p-3 font-semibold text-slate-900 bg-slate-50 border border-slate-300">{classNames[i]}</td>
                  {row.map((val, j) => (
                    <td key={j} className={`p-3 text-center border border-slate-300 font-mono ${i === j ? 'bg-slate-900 text-white font-bold' : val > 0 ? 'bg-red-50 text-red-700' : 'bg-white'}`}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Cara bacanya:</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• <strong>Sel diagonal (gelap)</strong> = prediksi BENAR</li>
            <li>• <strong>Sel off-diagonal (merah)</strong> = prediksi SALAH</li>
          </ul>
        </div>

        <CodeBlock title="📄 Lihat Kode — evaluation.ts → computeConfusionMatrix()">
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">computeConfusionMatrix</span>(actual, predicted, numClasses) {'{'}</div>
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// Inisialisasi matriks 3×3 dengan semua 0'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> cm = <span className="text-blue-400">Array</span>.<span className="text-blue-400">from</span>({'{'} length: numClasses {'}'}, () =&gt; <span className="text-blue-400">Array</span>(numClasses).<span className="text-blue-400">fill</span>(<span className="text-orange-300">0</span>));</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// Isi: untuk setiap sampel, tambah 1 ke sel (aktual, prediksi)'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> k = <span className="text-orange-300">0</span>; k {'<'} actual.length; k++) {'{'}</div>
          <div className="whitespace-pre">    cm[actual[k]][predicted[k]]++;</div>
          <div className="whitespace-pre">  {'}'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> cm;</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700 pt-3">
            <strong className="text-white">Penjelasan:</strong> <code className="text-blue-300">cm[actual][predicted]++</code> — baris = label asli, kolom = label prediksi. Sel diagonal = prediksi benar.
          </div>
        </CodeBlock>
      </Section>

      {/* ============================================================ */}
      {/* METRIK PERFORMA */}
      {/* ============================================================ */}
      <Section title="Metrik Performa" icon={Target} defaultOpen={true}>
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-slate-900">Nilai K:</label>
          <select
            value={selectedK}
            onChange={(e) => setSelectedK(parseInt(e.target.value, 10))}
            className="px-4 py-2 border-2 border-slate-200 focus:border-slate-900 outline-none font-mono"
          >
            {[1,2,3,4,5,6,7,8,9,10].map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500">(K optimal: {kOptimization.optimalK})</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Akurasi', value: evaluation.accuracy, rumus: 'TP+TN / Total' },
            { label: 'Precision', value: evaluation.macroPrecision, rumus: 'TP / (TP+FP)' },
            { label: 'Recall', value: evaluation.macroRecall, rumus: 'TP / (TP+FN)' },
            { label: 'F1-Score', value: evaluation.macroF1Score, rumus: '2×(P×R)/(P+R)' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-4 ${idx === 0 ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200'}`}>
              <div className={`text-xs uppercase tracking-widest mb-1 ${idx === 0 ? 'text-slate-300' : 'text-slate-500'}`}>{stat.label}</div>
              <div className={`text-2xl font-bold font-mono ${idx === 0 ? 'text-white' : 'text-slate-900'}`}>{(stat.value * 100).toFixed(2)}%</div>
              <div className={`text-[10px] mt-1 font-mono ${idx === 0 ? 'text-slate-400' : 'text-slate-500'}`}>{stat.rumus}</div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Apa arti tiap metrik:</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• <strong>Akurasi:</strong> Dari SEMUA prediksi, berapa yang bener?</li>
            <li>• <strong>Precision:</strong> Kalau model bilang "positif", seberapa bisa dipercaya?</li>
            <li>• <strong>Recall:</strong> Dari yang memang positif, berapa yang berhasil ditangkap?</li>
            <li>• <strong>F1-Score:</strong> Rata-rata harmonis Precision dan Recall.</li>
          </ul>
        </div>

        {/* Detail per kelas */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 text-left border border-slate-300">Kelas</th>
                <th className="p-3 text-center border border-slate-300">TP</th>
                <th className="p-3 text-center border border-slate-300">FP</th>
                <th className="p-3 text-center border border-slate-300">FN</th>
                <th className="p-3 text-center border border-slate-300">Precision</th>
                <th className="p-3 text-center border border-slate-300">Recall</th>
                <th className="p-3 text-center border border-slate-300">F1</th>
              </tr>
            </thead>
            <tbody>
              {evaluation.perClass.map((m) => (
                <tr key={m.label} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold border border-slate-300">{m.name}</td>
                  <td className="p-3 text-center font-mono border border-slate-300">{m.tp}</td>
                  <td className="p-3 text-center font-mono border border-slate-300">{m.fp}</td>
                  <td className="p-3 text-center font-mono border border-slate-300">{m.fn}</td>
                  <td className="p-3 text-center font-mono border border-slate-300">{(m.precision * 100).toFixed(2)}%</td>
                  <td className="p-3 text-center font-mono border border-slate-300">{(m.recall * 100).toFixed(2)}%</td>
                  <td className="p-3 text-center font-mono border border-slate-300">{(m.f1Score * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CodeBlock title="📄 Lihat Kode — evaluation.ts → computeMetrics()">
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">computeMetrics</span>(cm, numClasses) {'{'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> i = <span className="text-orange-300">0</span>; i {'<'} numClasses; i++) {'{'}</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> tp = cm[i][i]; <span className="text-slate-500 italic">{'// diagonal = benar'}</span></div>
          <div className="whitespace-pre">    <span className="text-pink-400">let</span> fp = <span className="text-orange-300">0</span>; <span className="text-pink-400">for</span> (j) fp += cm[j][i]; fp -= tp;</div>
          <div className="whitespace-pre">    <span className="text-pink-400">let</span> fn = <span className="text-orange-300">0</span>; <span className="text-pink-400">for</span> (j) fn += cm[i][j]; fn -= tp;</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> precision = tp / (tp + fp);</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> recall = tp / (tp + fn);</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> f1 = <span className="text-orange-300">2</span> * precision * recall / (precision + recall);</div>
          <div className="whitespace-pre">  {'}'}</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// Macro Average = rata-rata dari semua kelas'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> macroPrecision = perClass.<span className="text-blue-400">reduce</span>((s, m) =&gt; s + m.precision, <span className="text-orange-300">0</span>) / numClasses;</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700 pt-3">
            <strong className="text-white">Penjelasan:</strong> TP = diagonal, FP = total kolom - TP, FN = total baris - TP. Macro Average memberikan bobot SAMA untuk semua kelas.
          </div>
        </CodeBlock>
      </Section>

      {/* ============================================================ */}
      {/* OPTIMASI K */}
      {/* ============================================================ */}
      <Section title="Optimasi Nilai K" icon={TrendingUp}>
        <p className="text-sm text-slate-600">
          Pakai 5-Fold Cross-Validation buat cari K terbaik dari K=1 sampai K=15.
        </p>

        <div className="space-y-2">
          {kOptimization.results.map((r) => (
            <div key={r.k} className="flex items-center gap-3">
              <span className={`text-xs font-mono w-8 text-right ${r.k === kOptimization.optimalK ? 'font-bold text-slate-900' : 'text-slate-500'}`}>K={r.k}</span>
              <div className="flex-1 bg-slate-100 h-5 relative">
                <div className={`h-full ${r.k === kOptimization.optimalK ? 'bg-slate-900' : 'bg-slate-400'}`} style={{ width: `${r.f1Score * 100}%` }} />
                <span className="absolute right-2 top-0 h-5 flex items-center text-xs font-mono text-slate-700">{(r.f1Score * 100).toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-700"><strong>K Optimal: {kOptimization.optimalK}</strong> — F1-Score {(kOptimization.optimalF1Score * 100).toFixed(2)}%</p>
        </div>

        <CodeBlock title="📄 Lihat Kode — validation.ts → findOptimalK()">
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">findOptimalK</span>(dataset, maxK = <span className="text-orange-300">15</span>, kFolds = <span className="text-orange-300">5</span>, seed) {'{'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> results = [];</div>
          <div className="whitespace-pre">  <span className="text-pink-400">let</span> optimalK = <span className="text-orange-300">1</span>;</div>
          <div className="whitespace-pre">  <span className="text-pink-400">let</span> optimalF1 = <span className="text-orange-300">0</span>;</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-slate-500 italic">{'// Uji setiap K dari 1 sampai maxK'}</span></div>
          <div className="whitespace-pre">  <span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> k = <span className="text-orange-300">1</span>; k {'<='} maxK; k++) {'{'}</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> cv = <span className="text-blue-400">kFoldCrossValidation</span>(dataset, kFolds, k, seed);</div>
          <div className="whitespace-pre">    results.<span className="text-blue-400">push</span>({'{'} k, f1Score: cv.meanF1Score, accuracy: cv.meanAccuracy {'}'});</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">    <span className="text-pink-400">if</span> (cv.meanF1Score {'>'} optimalF1) {'{'}</div>
          <div className="whitespace-pre">      optimalF1 = cv.meanF1Score;</div>
          <div className="whitespace-pre">      optimalK = k;</div>
          <div className="whitespace-pre">    {'}'}</div>
          <div className="whitespace-pre">  {'}'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> {'{'} optimalK, results, optimalF1Score: optimalF1 {'}'};</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700 pt-3">
            <strong className="text-white">Penjelasan:</strong> Loop K=1..15, setiap K dijalankan 5-Fold CV, catat F1-Score. K dengan F1 tertinggi jadi optimal.
          </div>
        </CodeBlock>
      </Section>

      {/* ============================================================ */}
      {/* KORELASI */}
      {/* ============================================================ */}
      <Section title="Korelasi Antar Fitur" icon={Table2}>
        <p className="text-sm text-slate-600">
          Korelasi Pearson — ngukur seberapa erat hubungan antara dua fitur dari 13 input + 1 target. Range: -1 sampai +1.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 border border-slate-300 text-xs"></th>
                {correlations.features.map((f, i) => (
                  <th key={i} className="p-3 text-center border border-slate-300 text-xs">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlations.matrix.map((row, i) => (
                <tr key={i}>
                  <td className="p-3 font-semibold bg-slate-50 border border-slate-300 text-xs">{correlations.features[i]}</td>
                  {row.map((val, j) => {
                    const absVal = Math.abs(val);
                    let bgColor = 'bg-white';
                    if (i !== j) {
                      if (absVal > 0.7) bgColor = 'bg-red-100';
                      else if (absVal > 0.3) bgColor = 'bg-yellow-50';
                      else bgColor = 'bg-green-50';
                    }
                    return (
                      <td key={j} className={`p-3 text-center border border-slate-300 font-mono text-xs ${bgColor} ${i === j ? 'bg-slate-900 text-white font-bold' : ''}`}>
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Yang menarik:</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• <strong>14 kolom</strong>: 13 fitur + 1 target (status_odhiv).</li>
            <li>• Fitur numerik (umur, jumlah_pasangan, usia_pertama_hubungan) langsung dipakai.</li>
            <li>• Fitur kategorikal di-encode jadi angka oleh LabelEncoder.</li>
            <li>• Warna merah = korelasi kuat, kuning = sedang, hijau = lemah.</li>
          </ul>
        </div>

        <CodeBlock title="📄 Lihat Kode — correlation.ts → pearsonCorrelation()">
          <div className="whitespace-pre"><span className="text-pink-400">export function</span> <span className="text-blue-400">pearsonCorrelation</span>(x: <span className="text-teal-300">number</span>[], y: <span className="text-teal-300">number</span>[]): <span className="text-teal-300">number</span> {'{'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> n = x.length;</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> meanX = x.<span className="text-blue-400">reduce</span>((s, v) =&gt; s + v, <span className="text-orange-300">0</span>) / n;</div>
          <div className="whitespace-pre">  <span className="text-pink-400">const</span> meanY = y.<span className="text-blue-400">reduce</span>((s, v) =&gt; s + v, <span className="text-orange-300">0</span>) / n;</div>
          <div className="whitespace-pre" />
          <div className="whitespace-pre">  <span className="text-pink-400">let</span> num = <span className="text-orange-300">0</span>, denX = <span className="text-orange-300">0</span>, denY = <span className="text-orange-300">0</span>;</div>
          <div className="whitespace-pre">  <span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> i = <span className="text-orange-300">0</span>; i {'<'} n; i++) {'{'}</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> dx = x[i] - meanX;</div>
          <div className="whitespace-pre">    <span className="text-pink-400">const</span> dy = y[i] - meanY;</div>
          <div className="whitespace-pre">    num += dx * dy;       <span className="text-slate-500 italic">{'// Σ(xi-x̄)(yi-ȳ)'}</span></div>
          <div className="whitespace-pre">    denX += dx * dx;      <span className="text-slate-500 italic">{'// Σ(xi-x̄)²'}</span></div>
          <div className="whitespace-pre">    denY += dy * dy;      <span className="text-slate-500 italic">{'// Σ(yi-ȳ)²'}</span></div>
          <div className="whitespace-pre">  {'}'}</div>
          <div className="whitespace-pre">  <span className="text-pink-400">return</span> num / Math.<span className="text-blue-400">sqrt</span>(denX * denY);</div>
          <div className="whitespace-pre">{'}'}</div>
          <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700 pt-3">
            <strong className="text-white">Penjelasan:</strong> Rumus Pearson: <code className="text-blue-300">r = Σ((xi-x̄)(yi-ȳ)) / √(Σ(xi-x̄)² × Σ(yi-ȳ)²)</code>. Nilai mendekati -1 atau +1 = korelasi kuat.
          </div>
        </CodeBlock>
      </Section>
    </div>
  );
}
