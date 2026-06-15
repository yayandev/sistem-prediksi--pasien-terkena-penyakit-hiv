/**
 * seedData.ts
 * ===========
 * Data seed dari jurnal untuk di-import ke Firestore.
 * 21 record bersih (setelah data cleaning) dari RSUD Dr. Chasbullah Abdul Madjid Kota Bekasi.
 */

import { PatientData } from './firestore';

export const SEED_PATIENTS: Omit<PatientData, 'id' | 'createdAt' | 'createdBy'>[] = [
  { nama: 'Pasien 01', umur: 25, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'LSL', alasan_kunjungan: 'Tes HIV', status_odhiv: 'ODHIV' },
  { nama: 'Pasien 02', umur: 30, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'Pengguna Napza Suntik', alasan_kunjungan: 'Tes HIV', status_odhiv: 'ODHIV' },
  { nama: 'Pasien 03', umur: 28, jenis_kelamin: 'Perempuan', kelompok_populasi: 'Pekerja Seks', alasan_kunjungan: 'Tes HIV', status_odhiv: 'ODHIV' },
  { nama: 'Pasien 04', umur: 35, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'Populasi Umum', alasan_kunjungan: 'Kunjungan Rutin PDP', status_odhiv: 'Bukan ODHIV' },
  { nama: 'Pasien 05', umur: 22, jenis_kelamin: 'Perempuan', kelompok_populasi: 'Populasi Umum', alasan_kunjungan: 'Kunjungan Rutin PDP', status_odhiv: 'Bukan ODHIV' },
  { nama: 'Pasien 06', umur: 40, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'Waria', alasan_kunjungan: 'Tes HIV', status_odhiv: 'ODHIV' },
  { nama: 'Pasien 07', umur: 27, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'LSL', alasan_kunjungan: 'Kunjungan Rutin PDP', status_odhiv: 'Bukan ODHIV' },
  { nama: 'Pasien 08', umur: 45, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'Pasien TB', alasan_kunjungan: 'Tes HIV', status_odhiv: 'ODHIV' },
  { nama: 'Pasien 09', umur: 31, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'LSL', alasan_kunjungan: 'Tes HIV', status_odhiv: 'ODHIV' },
  { nama: 'Pasien 10', umur: 26, jenis_kelamin: 'Perempuan', kelompok_populasi: 'Populasi Umum', alasan_kunjungan: 'Kunjungan Rutin PDP', status_odhiv: 'Bukan ODHIV' },
  { nama: 'Pasien 11', umur: 38, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'Pengguna Napza Suntik', alasan_kunjungan: 'Tes HIV', status_odhiv: 'ODHIV' },
  { nama: 'Pasien 12', umur: 29, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'Populasi Umum', alasan_kunjungan: 'Kunjungan Rutin PDP', status_odhiv: 'Bukan ODHIV' },
  { nama: 'Pasien 13', umur: 24, jenis_kelamin: 'Perempuan', kelompok_populasi: 'Populasi Umum', alasan_kunjungan: 'Kunjungan Rutin PDP', status_odhiv: 'Bukan ODHIV' },
  { nama: 'Pasien 14', umur: 50, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'Pekerja Seks', alasan_kunjungan: 'Tes HIV', status_odhiv: 'ODHIV' },
  { nama: 'Pasien 15', umur: 32, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'LSL', alasan_kunjungan: 'Kunjungan Rutin PDP', status_odhiv: 'Bukan ODHIV' },
  { nama: 'Pasien 16', umur: 21, jenis_kelamin: 'Perempuan', kelompok_populasi: 'Populasi Umum', alasan_kunjungan: 'Kunjungan Rutin PDP', status_odhiv: 'Bukan ODHIV' },
  { nama: 'Pasien 17', umur: 42, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'Waria', alasan_kunjungan: 'Tes HIV', status_odhiv: 'ODHIV' },
  { nama: 'Pasien 18', umur: 36, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'Populasi Umum', alasan_kunjungan: 'Kunjungan Rutin PDP', status_odhiv: 'Bukan ODHIV' },
  { nama: 'Pasien 19', umur: 62, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'Pasien TB', alasan_kunjungan: 'Tes HIV', status_odhiv: 'ODHIV' },
  { nama: 'Pasien 20', umur: 23, jenis_kelamin: 'Perempuan', kelompok_populasi: 'Populasi Umum', alasan_kunjungan: 'Kunjungan Rutin PDP', status_odhiv: 'Bukan ODHIV' },
  { nama: 'Pasien 21', umur: 34, jenis_kelamin: 'Laki-laki', kelompok_populasi: 'LSL', alasan_kunjungan: 'Tes HIV', status_odhiv: 'ODHIV' },
];
