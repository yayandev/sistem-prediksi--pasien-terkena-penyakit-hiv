/**
 * firestore.ts
 * ============
 * CRUD operations untuk Firestore.
 * Collections: "patients", "predictions"
 */

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  where,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/* ================================================================
   TYPES
   ================================================================ */

export interface PatientData {
  id?: string;
  nama: string;
  umur: number;
  jenis_kelamin: string;
  kelompok_populasi: string;
  alasan_kunjungan: string;
  status_odhiv: string;
  createdAt?: Timestamp;
  createdBy?: string;
}

export interface PredictionData {
  id?: string;
  patientId?: string;
  nama: string;
  umur: number;
  jenis_kelamin: string;
  kelompok_populasi: string;
  alasan_kunjungan: string;
  predictedClass: number;
  predictedLabel: string;
  neighbors: Array<{ label: number; distance: number; rank: number }>;
  votes: Record<number, number>;
  createdAt?: Timestamp;
  createdBy?: string;
}

/* ================================================================
   PATIENTS CRUD
   ================================================================ */

const patientsCol = collection(db, 'patients');

/** Tambah pasien baru */
export async function addPatient(data: Omit<PatientData, 'id' | 'createdAt'>) {
  const docRef = await addDoc(patientsCol, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

/** Ambil semua pasien (terbaru dulu) */
export async function getPatients(): Promise<PatientData[]> {
  const q = query(patientsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PatientData));
}

/** Ambil satu pasien by ID */
export async function getPatient(id: string): Promise<PatientData | null> {
  const ref = doc(db, 'patients', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PatientData;
}

/** Update pasien */
export async function updatePatient(id: string, data: Partial<PatientData>) {
  const ref = doc(db, 'patients', id);
  await updateDoc(ref, data);
}

/** Hapus pasien */
export async function deletePatient(id: string) {
  const ref = doc(db, 'patients', id);
  await deleteDoc(ref);
}

/* ================================================================
   PREDICTIONS
   ================================================================ */

const predictionsCol = collection(db, 'predictions');

/** Simpan hasil prediksi */
export async function addPrediction(data: Omit<PredictionData, 'id' | 'createdAt'>) {
  const docRef = await addDoc(predictionsCol, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

/** Ambil semua prediksi (terbaru dulu) */
export async function getPredictions(): Promise<PredictionData[]> {
  const q = query(predictionsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PredictionData));
}

/* ================================================================
   DASHBOARD STATS
   ================================================================ */

export interface DashboardStats {
  totalPatients: number;
  totalPredictions: number;
  classDistribution: Record<string, number>;
  predictionDistribution: Record<string, number>;
  recentPredictions: PredictionData[];
}

/** Ambil stats dashboard */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [patients, predictions] = await Promise.all([getPatients(), getPredictions()]);

  // Hitung distribusi kelas dari data pasien
  const classDistribution: Record<string, number> = {};
  patients.forEach((p) => {
    classDistribution[p.status_odhiv] = (classDistribution[p.status_odhiv] || 0) + 1;
  });

  // Hitung distribusi prediksi
  const predictionDistribution: Record<string, number> = {};
  predictions.forEach((p) => {
    predictionDistribution[p.predictedLabel] =
      (predictionDistribution[p.predictedLabel] || 0) + 1;
  });

  return {
    totalPatients: patients.length,
    totalPredictions: predictions.length,
    classDistribution,
    predictionDistribution,
    recentPredictions: predictions.slice(0, 5),
  };
}

/* ================================================================
   SEED DATA IMPORT
   ================================================================ */

/** Import data seed dari JSON ke Firestore (hanya jika collection kosong) */
export async function importSeedData(
  seedData: Array<Omit<PatientData, 'id' | 'createdAt' | 'createdBy'>>,
  uid: string
) {
  // Cek apakah sudah ada data
  const existing = await getPatients();
  if (existing.length > 0) return false; // sudah ada data, skip

  // Import semua data sekaligus
  const promises = seedData.map((row) =>
    addDoc(patientsCol, {
      ...row,
      createdAt: Timestamp.now(),
      createdBy: uid,
    })
  );
  await Promise.all(promises);
  return true;
}
