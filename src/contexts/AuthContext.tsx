/**
 * AuthContext.tsx
 * ==============
 * Context untuk managing state autentikasi Firebase + role system.
 *
 * 2 Role:
 *   - admin: Full access (Dashboard, Kelola Pasien, Evaluasi, Users)
 *   - patient: Limited (Prediksi, Riwayat sendiri, Pengetahuan)
 *
 * Login methods:
 *   - Google Sign-In
 *   - Email + Password (register & login)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

export type UserRole = 'admin' | 'patient';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Timestamp;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<Pick<UserProfile, 'displayName'>>) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  addPasswordToAccount: (newPassword: string) => Promise<void>;
  hasPassword: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Load atau buat user profile di Firestore */
async function loadOrCreateProfile(firebaseUser: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  // Buat profile baru — default role "patient"
  const newProfile: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    role: 'patient',
    createdAt: Timestamp.now(),
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await loadOrCreateProfile(firebaseUser);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function registerWithEmail(email: string, password: string, name: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Update display name
    const userRef = doc(db, 'users', cred.user.uid);
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email,
      displayName: name,
      role: 'patient',
      createdAt: Timestamp.now(),
    };
    await setDoc(userRef, newProfile);
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setUserProfile(null);
  }

  async function updateProfileData(data: Partial<Pick<UserProfile, 'displayName'>>) {
    if (!user || !userProfile) throw new Error('Belum login');
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, data);
    setUserProfile({ ...userProfile, ...data });
  }

  async function updateUserPassword(currentPassword: string, newPassword: string) {
    if (!user || !user.email) throw new Error('Belum login');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword);
  }

  async function addPasswordToAccount(newPassword: string) {
    if (!user) throw new Error('Belum login');
    await firebaseUpdatePassword(user, newPassword);
  }

  function hasPassword(): boolean {
    if (!user) return false;
    return user.providerData.some((p) => p.providerId === 'password');
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, signInWithEmail, registerWithEmail, signOut, updateProfileData, updateUserPassword, addPasswordToAccount, hasPassword }}>
      {children}
    </AuthContext.Provider>
  );
}
