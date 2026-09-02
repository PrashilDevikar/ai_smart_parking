'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ParkingGrid } from '@/components/parking/ParkingGrid';
import { ParkingSlot, Booking } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Car,
  Clock,
  CalendarPlus,
  CheckCircle2,
  Video,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export default function UserDashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [meRes, slotsRes, bookingsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/parking/slots'),
        fetch('/api/bookings')
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        setSlots(slotsData.slots || []);
      }
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const bList: Booking[] = bookingsData.bookings || [];
        setRecentBookings(bList.slice(0, 4));
        const active = bList.find((b) => b.status === 'ACTIVE');
        setActiveBooking(active || null);
      }
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchDashboardData();
    }
  }, [fetchDashboardData]);

  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE').length;
  const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED').length;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 p-6 md:p-8 text-white shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time AI Vision Connected</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-heading">
              Welcome back, {user?.fullName || 'Customer'}!
            </h1>
            <p className="text-xs md:text-sm text-blue-100 max-w-xl font-normal">
              Find and reserve parking slots instantly. AI Computer Vision is currently active on Ground Floor cameras.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Link href="/live-parking">
              <Button variant="secondary" size="md" leftIcon={<Video className="w-4 h-4" />}>
                Live AI Feed
              </Button>
            </Link>
            <Link href="/book-slot">
              <Button
                size="md"
                className="bg-white text-blue-700 hover:bg-blue-50 border-0 shadow-md font-semibold"
                rightIcon={<CalendarPlus className="w-4 h-4" />}
              >
                Book Parking Slot
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Available Slots</span>
              <span className="text-2xl font-bold text-emerald-600 font-heading">{availableSlots}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Ready for reservation</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Occupied Slots</span>
              <span className="text-2xl font-bold text-red-600 font-heading">{occupiedSlots}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Detected by AI Vision</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Car className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Active Reservation</span>
              <span className="text-2xl font-bold text-blue-600 font-heading">
                {activeBooking ? `Slot ${activeBooking.slot?.slotNumber}` : 'None'}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {activeBooking
                  ? `Until ${new Date(activeBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'No active session'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Bookings</span>
              <span className="text-2xl font-bold text-purple-600 font-heading">
                {user?.totalBookings ?? recentBookings.length}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Completed sessions</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Live Parking Layout & Availability</h3>
            <p className="text-xs text-slate-500">Live slot occupancy across all building levels</p>
          </div>
          <Link href="/book-slot">
            <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Reserve a Slot
            </Button>
          </Link>
        </div>
        <ParkingGrid slots={slots} onRefresh={fetchDashboardData} isLoading={isLoading} selectable={false} />
      </div>

      {/* Recent History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 font-heading">My Recent Reservations</h3>
          <Link href="/booking-history" className="text-xs font-semibold text-blue-600 hover:underline">
            View All History →
          </Link>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Slot</th>
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Time Interval</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No reservations yet. Click "Book Parking Slot" to make your first reservation!
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 font-heading">
                        Slot {b.slot?.slotNumber} ({b.slot?.floor})
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">{b.vehicleNumber}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDateTime(b.startTime)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{b.duration} hr(s)</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(b.amount)}</td>
                      <td className="px-6 py-4">
                        <Badge status={b.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
