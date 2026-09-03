'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  Grid3X3,
  Users,
  CalendarCheck,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const OP_NAV = [
  { name: 'Dashboard', href: '/operator/dashboard', icon: LayoutDashboard },
  { name: 'Live AI Camera', href: '/operator/live-parking', icon: Video, badge: 'LIVE' },
  { name: 'Manage Slots', href: '/operator/slots', icon: Grid3X3 },
  { name: 'User Management', href: '/operator/users', icon: Users },
  { name: 'All Bookings', href: '/operator/bookings', icon: CalendarCheck },
  { name: 'Reports & Analytics', href: '/operator/reports', icon: BarChart3 },
  { name: 'System Settings', href: '/operator/settings', icon: Settings },
];

export function OperatorSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col min-h-screen shrink-0 sticky top-0 h-screen z-30">
      <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-900 font-bold shadow-md shadow-emerald-500/20">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-white tracking-tight block text-sm font-heading leading-tight">AI PARKING</span>
          <span className="text-[11px] text-emerald-400 font-semibold tracking-wide uppercase">Operator Control</span>
        </div>
      </div>
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operations</div>
        {OP_NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/operator/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive ? 'bg-blue-600 text-white shadow-md font-semibold' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="p-3 border-t border-slate-800">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors">
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
