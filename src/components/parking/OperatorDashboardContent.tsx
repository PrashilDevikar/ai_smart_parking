'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OccupancyDonutChart } from '@/components/charts/OccupancyDonutChart';
import { RevenueBarChart } from '@/components/charts/RevenueBarChart';
import { BookingTrendChart } from '@/components/charts/BookingTrendChart';
import { OperatorKPIs, Booking } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Users,
  Grid3X3,
  Video,
  CalendarCheck,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export default function OperatorDashboardContent() {
  const [data, setData] = useState<{
    kpis: OperatorKPIs;
    occupancyChartData: any[];
    revenueTrendData: any[];
    recentBookings: Booking[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/operator/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load operator dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpis = data?.kpis;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Operator Executive Control Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            System & Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-floor slot metrics, live revenue tracking, and automated YOLO computer vision status.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Metrics
          </Button>
          <Link href="/live-parking">
            <Button size="sm" variant="secondary" leftIcon={<Video className="w-4 h-4" />}>
              Open Live AI
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="p-4 bg-white hover:shadow-md transition-shadow">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Users</span>
          <span className="text-2xl font-bold text-slate-900 font-heading block mt-1">{kpis?.totalUsers ?? 0}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Registered Drivers</span>
        </Card>
        <Card className="p-4 bg-white hover:shadow-md transition-shadow">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Slots</span>
          <span className="text-2xl font-bold text-slate-900 font-heading block mt-1">{kpis?.totalSlots ?? 24}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">3 Active Floors</span>
        </Card>
        <Card className="p-4 bg-white hover:shadow-md transition-shadow">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Available</span>
          <span className="text-2xl font-bold text-emerald-600 font-heading block mt-1">{kpis?.availableSlots ?? 0}</span>
          <span className="text-[10px] text-emerald-700/60 mt-0.5 block">Free for Parking</span>
        </Card>
        <Card className="p-4 bg-white hover:shadow-md transition-shadow">
          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block">Occupied</span>
          <span className="text-2xl font-bold text-red-600 font-heading block mt-1">{kpis?.occupiedSlots ?? 0}</span>
          <span className="text-[10px] text-red-700/60 mt-0.5 block">AI Vision Verified</span>
        </Card>
        <Card className="p-4 bg-white hover:shadow-md transition-shadow">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">Reserved</span>
          <span className="text-2xl font-bold text-amber-600 font-heading block mt-1">{kpis?.reservedSlots ?? 0}</span>
          <span className="text-[10px] text-amber-700/60 mt-0.5 block">Upcoming Sessions</span>
        </Card>
        <Card className="p-4 bg-white hover:shadow-md transition-shadow">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Today Revenue</span>
          <span className="text-2xl font-bold text-blue-600 font-heading block mt-1">
            {formatCurrency(kpis?.todayRevenue ?? 0)}
          </span>
          <span className="text-[10px] text-blue-700/60 mt-0.5 block">All Bookings</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Slot Occupancy Ratio</span>
              <span className="text-xs font-bold text-blue-600 font-mono">{kpis?.occupancyRate ?? 0}% Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <OccupancyDonutChart data={data?.occupancyChartData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Weekly Revenue Trend</span>
              <span className="text-xs font-semibold text-slate-500">Last 7 Days</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <RevenueBarChart data={data?.revenueTrendData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Booking Volume</span>
              <span className="text-xs font-semibold text-slate-500">Daily Demand</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <BookingTrendChart data={data?.revenueTrendData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}