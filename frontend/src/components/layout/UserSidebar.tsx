'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Video, CalendarPlus, History, User, LogOut, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

const USER_NAV = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Parking (AI)', href: '/live-parking', icon: Video, badge: 'YOLO' },
  { name: 'Book Parking Slot', href: '/book-slot', icon: CalendarPlus },
  { name: 'Booking History', href: '/booking-history', icon: History },
  { name: 'My Profile', href: '/profile', icon: User },
];

export function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen shrink-0 sticky top-0 h-screen z-30">
      <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Car className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight block text-sm font-heading leading-tight">AI PARKING</span>
          <span className="text-[11px] text-blue-600 font-medium tracking-wide uppercase">Customer Portal</span>
        </div>
      </div>
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Main Menu</div>
        {USER_NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive ? 'bg-blue-50 text-blue-700 shadow-sm font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700 tracking-wider">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="p-3 border-t border-slate-100">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
