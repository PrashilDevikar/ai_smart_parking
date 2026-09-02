'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReceiptModal } from '@/components/parking/ReceiptModal';
import { Booking } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  History,
  Search,
  Printer,
  XCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function BookingHistoryContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error('Failed to load bookings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking? The slot will be released and your payment refunded.')) {
      return;
    }
    setCancellingId(id);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: 'Reservation cancelled successfully and refund processed.' });
        fetchBookings();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to cancel reservation' });
      }
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'Network error while cancelling' });
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchSearch =
      b.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slot?.slotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Booking History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review past parking sessions, print official receipts, or cancel upcoming reservations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Refresh History
        </Button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                filterStatus === st ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
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
            placeholder="Search slot or vehicle #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Booking ID</th>
                <th className="px-6 py-3.5">Slot Location</th>
                <th className="px-6 py-3.5">Vehicle</th>
                <th className="px-6 py-3.5">Time Period</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No reservations found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      #{b.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 font-heading">Slot {b.slot?.slotNumber}</div>
                      <div className="text-[11px] text-slate-500">{b.slot?.floor}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800">{b.vehicleNumber}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-medium text-slate-800">{formatDateTime(b.startTime)}</div>
                      <div className="text-[11px] text-slate-400">to {formatDateTime(b.endTime)}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{b.duration} hr(s)</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(b.amount)}</td>
                    <td className="px-6 py-4">
                      <Badge status={b.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReceipt(b)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View / Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {b.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          disabled={cancellingId === b.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-4 h-4" />
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
