import React from 'react';
import { cn } from '@/lib/utils';
import { SlotStatus, BookingStatus } from '@/types';

export interface BadgeProps {
  status?: SlotStatus | BookingStatus | string;
  variant?: 'available' | 'occupied' | 'reserved' | 'selected' | 'maintenance' | 'default' | 'active' | 'completed' | 'cancelled';
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ status, variant, children, className }: BadgeProps) {
  let finalVariant = variant || 'default';
  if (status) {
    const s = status.toUpperCase();
    if (s === 'AVAILABLE') finalVariant = 'available';
    else if (s === 'OCCUPIED') finalVariant = 'occupied';
    else if (s === 'RESERVED') finalVariant = 'reserved';
    else if (s === 'MAINTENANCE') finalVariant = 'maintenance';
    else if (s === 'ACTIVE') finalVariant = 'active';
    else if (s === 'COMPLETED') finalVariant = 'completed';
    else if (s === 'CANCELLED') finalVariant = 'cancelled';
  }
  const styles = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    occupied: 'bg-red-50 text-red-700 border-red-200',
    reserved: 'bg-amber-50 text-amber-700 border-amber-200',
    selected: 'bg-blue-50 text-blue-700 border-blue-200',
    maintenance: 'bg-slate-100 text-slate-600 border-slate-200',
    active: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  const dots = {
    available: 'bg-emerald-500',
    occupied: 'bg-red-500',
    reserved: 'bg-amber-500',
    selected: 'bg-blue-500',
    maintenance: 'bg-slate-400',
    active: 'bg-blue-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-rose-500',
    default: 'bg-slate-400',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase', styles[finalVariant], className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dots[finalVariant])} />
      {children || status}
    </span>
  );
}
