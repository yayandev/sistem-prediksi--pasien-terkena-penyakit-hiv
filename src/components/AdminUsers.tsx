/**
 * AdminUsers.tsx
 * ==============
 * Admin-only page — kelola role users (promote/demote admin/patient).
 */

import React, { useEffect, useState } from 'react';
import { getUsers, updateUserRole, UserProfileData } from '../lib/firestore';
import { Users, Loader2, Shield, UserCheck, UserMinus } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  }

  async function toggleRole(uid: string, currentRole: 'admin' | 'patient') {
    setUpdating(uid);
    const newRole = currentRole === 'admin' ? 'patient' : 'admin';
    await updateUserRole(uid, newRole);
    await loadUsers();
    setUpdating(null);
  }

  function formatDate(ts: unknown) {
    if (!ts || typeof ts !== 'object' || !('toDate' in ts)) return '-';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ts as any).toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight uppercase mb-2">
          Kelola Users
        </h1>
        <p className="text-sm text-slate-500">Atur role admin/patient untuk setiap user</p>
      </div>

      <div className="bg-white border-2 border-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Bergabung</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{u.displayName}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-1 rounded ${
                      u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleRole(u.uid, u.role)}
                      disabled={updating === u.uid}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors disabled:opacity-50 ${
                        u.role === 'admin'
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}
                    >
                      {updating === u.uid ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : u.role === 'admin' ? (
                        <UserMinus className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {u.role === 'admin' ? 'Jadikan Patient' : 'Jadikan Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Belum ada user terdaftar</p>
          </div>
        )}
      </div>
    </div>
  );
}
