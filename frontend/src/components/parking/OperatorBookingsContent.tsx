'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReceiptModal } from '@/components/parking/ReceiptModal';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Search, Printer, RefreshCw } from 'lucide-react';

export default function OperatorBookingsContent() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/operator/bookings?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch('/api/operator/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status }),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            All System Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete database audit log of customer parking reservations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Refresh Bookings
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                statusFilter === st ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, vehicle, slot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Slot Location</th>
                <th className="px-6 py-3.5">Vehicle</th>
                <th className="px-6 py-3.5">Time Interval</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Revenue</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    No reservations recorded matching filter
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 font-heading">{b.user?.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{b.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      Slot {b.slot?.slotNumber} ({b.slot?.floor})
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800">{b.vehicleNumber}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{formatDateTime(b.startTime)}</div>
                      <div className="text-[10px] text-slate-400">to {formatDateTime(b.endTime)}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{b.duration} hr(s)</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{formatCurrency(b.amount)}</td>
                    <td className="px-6 py-4">
                      <Badge status={b.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReceipt(b)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Print Voucher"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {b.status === 'ACTIVE' && (
                        <button
                          onClick={() => updateStatus(b.id, 'COMPLETED')}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ReceiptModal
        booking={selectedReceipt}
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
