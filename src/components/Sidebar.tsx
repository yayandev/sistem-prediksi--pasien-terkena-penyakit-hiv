/**
 * Sidebar.tsx
 * ==========
 * Sidebar navigation untuk app layout setelah login.
 * Role-based menu items + responsive (drawer on mobile).
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
  ChevronLeft,
  Shield,
  User,
  History,
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
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/prediksi', label: 'Prediksi', icon: Brain },
  { to: '/dashboard/pasien', label: 'Pasien', icon: Users, adminOnly: true },
  { to: '/dashboard/admin/users', label: 'Users', icon: UserCog, adminOnly: true },
  { to: '/dashboard/evaluasi', label: 'Evaluasi Model', icon: Zap, adminOnly: true },
  { to: '/dashboard/riwayat', label: 'Riwayat', icon: History },
  { to: '/dashboard/pengetahuan', label: 'Pengetahuan', icon: BookOpen },
  { to: '/dashboard/tentang', label: 'Tentang', icon: Info },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, userProfile, signOut } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  React.useEffect(() => {
    onClose();
  }, [location.pathname]);

  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  async function handleLogout() {
    try {
      await signOut();
    } catch {
      /* silent */
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-slate-900" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight uppercase">VECTRA</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">HIV Predictor</div>
          </div>
        </NavLink>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isDashboard = item.to === '/dashboard';
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={isDashboard}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full" />
            ) : (
              <User className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {userProfile?.displayName || user?.displayName || user?.email?.split('@')[0]}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isAdmin && <Shield className="w-3 h-3 text-amber-400" />}
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isAdmin ? 'text-amber-400' : 'text-slate-500'}`}>
                {userProfile?.role || 'patient'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-[260px]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[260px] lg:hidden animate-in slide-in-from-left">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
