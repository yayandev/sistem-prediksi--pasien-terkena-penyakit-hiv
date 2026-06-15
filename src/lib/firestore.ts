/**
 * firestore.ts
 * ============
 * CRUD operations untuk Firestore.
 * Collections: "users", "patients", "predictions"
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
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserRole } from '../contexts/AuthContext';

/* ================================================================
   TYPES
   ================================================================ */

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: Timestamp;
}

export interface PatientData {
  id?: string;
  nama: string;
  umur: number;
  jenis_kelamin: string;
  kelompok_populasi: string;
  alasan_kunjungan: string;
  riwayat_tes_hiv: string;
  riwayat_ims: string;
  jumlah_pasangan_seksual: number;
  penggunaan_kondom: string;
  penggunaan_napza_suntik: string;
  status_pernikahan: string;
  usia_pertama_hubungan: number;
  terapi_arv: string;
  gejala_klinis: string;
  status_odhiv: string;
  createdAt?: Timestamp;
  createdBy?: string;
}

export interface PredictionData {
  id?: string;
  patientId?: string;
  nama: string;
  umur: number;
  jenis_kelamin: number;
  kelompok_populasi: number;
  alasan_kunjungan: number;
  riwayat_tes_hiv: number;
  riwayat_ims: number;
  jumlah_pasangan_seksual: number;
  penggunaan_kondom: number;
  penggunaan_napza_suntik: number;
  status_pernikahan: number;
  usia_pertama_hubungan: number;
  terapi_arv: number;
  gejala_klinis: number;
  predictedClass: number;
  predictedLabel: string;
  neighbors: Array<{ label: number; distance: number; rank: number }>;
  votes: Record<number, number>;
  createdAt?: Timestamp;
  createdBy?: string;
}

/* ================================================================
   USERS
   ================================================================ */

const usersCol = collection(db, 'users');

export async function getUsers(): Promise<UserProfileData[]> {
  const q = query(usersCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data() } as UserProfileData));
}

export async function updateUserRole(uid: string, role: UserRole) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { role });
}

/* ================================================================
   PATIENTS CRUD
   ================================================================ */

const patientsCol = collection(db, 'patients');

export async function addPatient(data: Omit<PatientData, 'id' | 'createdAt'>) {
  const docRef = await addDoc(patientsCol, { ...data, createdAt: Timestamp.now() });
  return docRef.id;
}

export async function getPatients(): Promise<PatientData[]> {
  const q = query(patientsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PatientData));
}

export async function deletePatient(id: string) {
  await deleteDoc(doc(db, 'patients', id));
}

/** Import data seed ke Firestore */
export async function importSeedData(seedData: Omit<PatientData, 'id' | 'createdAt'>[], createdBy: string): Promise<number> {
  let imported = 0;
  for (const record of seedData) {
    await addPatient({ ...record, createdBy });
    imported++;
  }
  return imported;
}

/* ================================================================
   PREDICTIONS
   ================================================================ */

const predictionsCol = collection(db, 'predictions');

export async function addPrediction(data: Omit<PredictionData, 'id' | 'createdAt'>) {
  const docRef = await addDoc(predictionsCol, { ...data, createdAt: Timestamp.now() });
  return docRef.id;
}

export async function getPredictions(): Promise<PredictionData[]> {
  const q = query(predictionsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PredictionData));
}

/** Ambil prediksi untuk user tertentu (patient view) */
export async function getPredictionsByUser(uid: string): Promise<PredictionData[]> {
  const all = await getPredictions();
  return all.filter((p) => p.createdBy === uid);
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

export async function getDashboardStats(): Promise<DashboardStats> {
  const [patients, predictions] = await Promise.all([getPatients(), getPredictions()]);

  const classDistribution: Record<string, number> = {};
  patients.forEach((p) => {
    classDistribution[p.status_odhiv] = (classDistribution[p.status_odhiv] || 0) + 1;
  });

  const predictionDistribution: Record<string, number> = {};
  predictions.forEach((p) => {
    predictionDistribution[p.predictedLabel] = (predictionDistribution[p.predictedLabel] || 0) + 1;
  });

  return {
    totalPatients: patients.length,
    totalPredictions: predictions.length,
    classDistribution,
    predictionDistribution,
    recentPredictions: predictions.slice(0, 5),
  };
}
