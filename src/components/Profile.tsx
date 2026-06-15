/**
 * Profile.tsx
 * ==========
 * Halaman profil — ganti nama, ganti password, tambah password (untuk user Google).
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Shield,
  Lock,
  Mail,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  KeyRound,
} from 'lucide-react';

export default function Profile() {
  const { user, userProfile, updateProfileData, updateUserPassword, addPasswordToAccount, hasPassword } = useAuth();

  // Profile form
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form (for users with password)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add password form (for Google users)
  const [addPwd, setAddPwd] = useState('');
  const [addPwdConfirm, setAddPwdConfirm] = useState('');
  const [savingAddPwd, setSavingAddPwd] = useState(false);
  const [addPwdMsg, setAddPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const userHasPassword = hasPassword();
  const isGoogleUser = user?.providerData?.some((p) => p.providerId === 'google.com');

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateProfileData({ displayName: displayName.trim() });
      setProfileMsg({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } catch (err: unknown) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'Gagal menyimpan' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: 'Semua field harus diisi' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }
    setSavingPassword(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password berhasil diubah!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setPasswordMsg({ type: 'error', text: 'Password saat ini salah' });
      } else {
        setPasswordMsg({ type: 'error', text: msg || 'Gagal mengubah password' });
      }
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleAddPassword(e: React.FormEvent) {
    e.preventDefault();
    setAddPwdMsg(null);
    if (!addPwd || !addPwdConfirm) {
      setAddPwdMsg({ type: 'error', text: 'Semua field harus diisi' });
      return;
    }
    if (addPwd.length < 6) {
      setAddPwdMsg({ type: 'error', text: 'Password minimal 6 karakter' });
      return;
    }
    if (addPwd !== addPwdConfirm) {
      setAddPwdMsg({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }
    setSavingAddPwd(true);
    try {
      await addPasswordToAccount(addPwd);
      setAddPwdMsg({ type: 'success', text: 'Password berhasil ditambahkan! Sekarang Anda bisa login dengan email & password.' });
      setAddPwd('');
      setAddPwdConfirm('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('requires-recent-login')) {
        setAddPwdMsg({ type: 'error', text: 'Silakan logout lalu login kembali, baru tambahkan password.' });
      } else {
        setAddPwdMsg({ type: 'error', text: msg || 'Gagal menambahkan password' });
      }
    } finally {
      setSavingAddPwd(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola informasi akun dan keamanan Anda.</p>
      </div>

      {/* Info Akun */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full" />
            ) : (
              <User className="w-7 h-7 text-slate-400" />
            )}
          </div>
          <div>
            <div className="font-semibold text-lg">{userProfile?.displayName}</div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold uppercase text-amber-600">{userProfile?.role}</span>
              {isGoogleUser && (
                <span className="text-xs text-slate-400 ml-2">• Login via Google</span>
              )}
              {userHasPassword && (
                <span className="text-xs text-slate-400 ml-2">• Email & Password</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profil */}
      <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          Edit Profil
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Nama Tampilan</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              placeholder="Nama Anda"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
        {profileMsg && (
          <div className={`mt-4 flex items-center gap-2 text-sm ${profileMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
            {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {profileMsg.text}
          </div>
        )}
        <button
          type="submit"
          disabled={savingProfile || !displayName.trim()}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>

      {/* Tambah Password (untuk user Google yang belum punya password) */}
      {isGoogleUser && !userHasPassword && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-base font-bold mb-2 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-500" />
            Tambahkan Password
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Anda login dengan Google. Tambahkan password agar bisa login juga dengan email & password.
          </p>
          <form onSubmit={handleAddPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Password Baru</label>
              <input
                type="password"
                value={addPwd}
                onChange={(e) => setAddPwd(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Konfirmasi Password</label>
              <input
                type="password"
                value={addPwdConfirm}
                onChange={(e) => setAddPwdConfirm(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="Ulangi password"
              />
            </div>
            {addPwdMsg && (
              <div className={`flex items-center gap-2 text-sm ${addPwdMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                {addPwdMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {addPwdMsg.text}
              </div>
            )}
            <button
              type="submit"
              disabled={savingAddPwd}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {savingAddPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {savingAddPwd ? 'Menambahkan...' : 'Tambahkan Password'}
            </button>
          </form>
        </div>
      )}

      {/* Ganti Password (untuk user yang sudah punya password) */}
      {userHasPassword && (
        <form onSubmit={handleChangePassword} className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            Ganti Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Password Saat Ini</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="Masukkan password saat ini"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="Ulangi password baru"
              />
            </div>
          </div>
          {passwordMsg && (
            <div className={`mt-4 flex items-center gap-2 text-sm ${passwordMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {passwordMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {passwordMsg.text}
            </div>
          )}
          <button
            type="submit"
            disabled={savingPassword}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {savingPassword ? 'Mengubah...' : 'Ganti Password'}
          </button>
        </form>
      )}
    </div>
  );
}
