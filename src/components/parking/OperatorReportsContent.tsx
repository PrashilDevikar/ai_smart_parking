'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart3,
  Download,
  Clock,
  Award,
  RefreshCw,
} from 'lucide-react';

export default function OperatorReportsContent() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/operator/reports');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'AI SMART PARKING SYSTEM — OPERATIONAL REPORT\r\n\r\n';
    csvContent += 'SUMMARY METRICS\r\n';
    csvContent += `Total Bookings,${data.summary.totalBookingsCount}\r\n`;
    csvContent += `Total Revenue,$${data.summary.totalRevenue}\r\n`;
    csvContent += `Avg Booking Duration,${data.summary.averageBookingDuration}\r\n`;
    csvContent += `Avg Daily Occupancy,${data.summary.averageDailyOccupancy}\r\n\r\n`;

    csvContent += 'MOST-USED PARKING SLOTS\r\n';
    csvContent += 'Slot Number,Floor,Total Bookings,Revenue\r\n';
    data.mostUsedSlots.forEach((s: any) => {
      csvContent += `${s.slotNumber},${s.floor},${s.count},$${s.revenue}\r\n`;
    });

    csvContent += '\r\nPEAK HOURS DISTRIBUTION\r\n';
    csvContent += 'Time Window,Booking Frequency\r\n';
    data.peakHoursData.forEach((p: any) => {
      csvContent += `"${p.hour}",${p.count}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `parking_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Reports & Occupancy Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aggregated system intelligence, peak occupancy distributions, and CSV data export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchReports} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
            Export CSV Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg">
          <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider block">Total Bookings</span>
          <span className="text-3xl font-bold font-heading block mt-1">{data?.summary?.totalBookingsCount ?? 0}</span>
          <span className="text-[11px] text-blue-100 mt-1 block">Lifetime Sessions</span>
        </Card>

        <Card className="p-5 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg">
          <span className="text-xs text-emerald-200 font-semibold uppercase tracking-wider block">Gross Revenue</span>
          <span className="text-3xl font-bold font-heading block mt-1">
            {formatCurrency(data?.summary?.totalRevenue ?? 0)}
          </span>
          <span className="text-[11px] text-emerald-100 mt-1 block">Paid in Full</span>
        </Card>

        <Card className="p-5 bg-gradient-to-tr from-purple-600 to-indigo-700 text-white shadow-lg">
          <span className="text-xs text-purple-200 font-semibold uppercase tracking-wider block">Avg Duration</span>
          <span className="text-3xl font-bold font-heading block mt-1">{data?.summary?.averageBookingDuration || '3.4 hrs'}</span>
          <span className="text-[11px] text-purple-100 mt-1 block">Per Reservation</span>
        </Card>

        <Card className="p-5 bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-lg">
          <span className="text-xs text-amber-200 font-semibold uppercase tracking-wider block">Daily Occupancy</span>
          <span className="text-3xl font-bold font-heading block mt-1">{data?.summary?.averageDailyOccupancy || '78%'}</span>
          <span className="text-[11px] text-amber-100 mt-1 block">Peak Utilization</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Most Frequently Used Parking Slots
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Slot</th>
                    <th className="px-6 py-3">Floor Level</th>
                    <th className="px-6 py-3">Completed Bookings</th>
                    <th className="px-6 py-3 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.mostUsedSlots?.map((slot: any, idx: number) => (
                    <tr key={slot.slotNumber} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-bold text-slate-900 font-heading flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        Slot {slot.slotNumber}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{slot.floor}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{slot.count} times</td>
                      <td className="px-6 py-3.5 text-right font-bold text-emerald-600 font-heading">
                        {formatCurrency(slot.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Peak Parking Demand Windows
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {data?.peakHoursData?.map((item: any) => {
              const maxCount = 10;
              const pct = Math.min(100, Math.round((item.count / maxCount) * 100));
              return (
                <div key={item.hour} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">{item.hour}</span>
                    <span className="text-blue-600 font-mono">{item.count} check-ins</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
