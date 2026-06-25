/**
 * Sidebar.tsx
 * ==========
 * Sidebar navigation untuk app layout setelah login.
 * Wider, cleaner, responsive dengan drawer di mobile.
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Stethoscope,
  LayoutDashboard,
  Brain,
  Users,
  UserCog,
  Zap,
  BookOpen,
  Info,
  LogOut,
  X,
  Shield,
  User,
  History,
  CircleUserRound,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  patientOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/prediksi', label: 'Prediksi', icon: Brain },
  { to: '/dashboard/pasien', label: 'Data Pasien', icon: Users, adminOnly: true },
  { to: '/dashboard/admin/riwayat', label: 'Riwayat Prediksi', icon: History, adminOnly: true },
  { to: '/dashboard/admin/users', label: 'Kelola Users', icon: UserCog, adminOnly: true },
  { to: '/dashboard/evaluasi', label: 'Evaluasi Model', icon: Zap },
  { to: '/dashboard/riwayat', label: 'Riwayat Saya', icon: History, patientOnly: true },
  { to: '/dashboard/pengetahuan', label: 'Pengetahuan', icon: BookOpen },
  { to: '/dashboard/tentang', label: 'Tentang', icon: Info },
  { to: '/dashboard/profil', label: 'Profil Saya', icon: CircleUserRound },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, userProfile, signOut } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  React.useEffect(() => {
    onClose();
  }, [location.pathname]);

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (isAdmin && item.patientOnly) return false;
    if (!isAdmin && item.adminOnly) return false;
    return true;
  });

  async function handleLogout() {
    try { await signOut(); } catch { /* silent */ }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-slate-800/80 shrink-0">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5 text-slate-900" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[15px] tracking-tight uppercase">VECTRA</div>
          <div className="text-[11px] text-slate-500 tracking-wide">HIV Predictor System</div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-1.5">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isDashboard = item.to === '/dashboard';
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={isDashboard}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 text-[14px] font-medium rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-slate-800/80 p-4 shrink-0">
        <div className="flex items-center gap-3 px-1 mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <User className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {userProfile?.displayName || user?.displayName || user?.email?.split('@')[0]}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {isAdmin && <Shield className="w-3 h-3 text-amber-400" />}
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isAdmin ? 'text-amber-400' : 'text-slate-500'}`}>
                {userProfile?.role || 'patient'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-[272px]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50 lg:hidden transition-opacity"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden shadow-2xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
