'use client';
import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Booking } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Printer, CheckCircle } from 'lucide-react';

export interface ReceiptModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ booking, isOpen, onClose }: ReceiptModalProps) {
  if (!booking) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Parking Reservation Receipt" maxWidth="md">
      <div id="printable-receipt" className="space-y-6">
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900 font-heading">AI Smart Parking Terminal</h4>
          <p className="text-xs text-slate-500">Official Booking & Payment Voucher</p>
          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
            VOUCHER #{booking.id.substring(0, 8).toUpperCase()}
          </div>
        </div>
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Assigned Slot</span>
            <span className="font-bold text-slate-900 text-sm font-heading">Slot {booking.slot?.slotNumber} ({booking.slot?.floor})</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Vehicle Registration</span>
            <span className="font-bold text-slate-900 font-mono">{booking.vehicleNumber}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Entry Time</span>
            <span className="font-semibold text-slate-800">{formatDateTime(booking.startTime)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Exit Time</span>
            <span className="font-semibold text-slate-800">{formatDateTime(booking.endTime)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Duration</span>
            <span className="font-semibold text-slate-800">{booking.duration} Hour(s)</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Payment Status</span>
            <span className="font-bold text-emerald-600 uppercase">✓ {booking.paymentStatus}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-slate-900 font-bold text-sm">Total Paid</span>
            <span className="text-base font-bold text-blue-600 font-heading">{formatCurrency(booking.amount)}</span>
          </div>
        </div>
        <div className="text-center p-3 bg-white border border-dashed border-slate-300 rounded-xl space-y-1">
          <div className="font-mono text-[10px] text-slate-400">||| ||||| |||| |||||| ||||| |||</div>
          <span className="text-[11px] text-slate-500 font-medium">Scan QR at Gate 1 for Automatic AI Barrier Access</span>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" className="w-full" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
            Print Receipt
          </Button>
          <Button className="w-full" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
