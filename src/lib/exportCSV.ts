/**
 * exportCSV.ts
 * ============
 * Utility untuk export data ke file CSV.
 */

import { PatientData, PredictionData } from './firestore';

/** Download file CSV dari string content */
function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Export data pasien ke CSV */
export function exportPatientsCSV(patients: PatientData[]) {
  const headers = ['Nama', 'Umur', 'Jenis Kelamin', 'Kelompok Populasi', 'Alasan Kunjungan', 'Status ODHIV'];
  const rows = patients.map((p) => [
    p.nama,
    p.umur.toString(),
    p.jenis_kelamin,
    p.kelompok_populasi,
    p.alasan_kunjungan,
    p.status_odhiv,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const date = new Date().toISOString().slice(0, 10);
  downloadCSV(csvContent, `data-pasien-${date}.csv`);
}

/** Export riwayat prediksi ke CSV */
export function exportPredictionsCSV(predictions: PredictionData[]) {
  const headers = [
    'Nama',
    'Umur',
    'Jenis Kelamin',
    'Kelompok Populasi',
    'Alasan Kunjungan',
    'Prediksi',
    'Kelas',
    'Tanggal',
  ];
  const rows = predictions.map((p) => [
    p.nama,
    p.umur.toString(),
    p.jenis_kelamin,
    p.kelompok_populasi,
    p.alasan_kunjungan,
    p.predictedLabel,
    p.predictedClass.toString(),
    p.createdAt ? p.createdAt.toDate().toLocaleDateString('id-ID') : '-',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const date = new Date().toISOString().slice(0, 10);
  downloadCSV(csvContent, `riwayat-prediksi-${date}.csv`);
}
