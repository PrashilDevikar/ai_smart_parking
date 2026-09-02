'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ParkingGrid } from '@/components/parking/ParkingGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ReceiptModal } from '@/components/parking/ReceiptModal';
import { ParkingSlot, Booking } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Car,
  CreditCard,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function BookSlotContent() {
  const router = useRouter();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [startTime, setStartTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(2);
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setStartTime(now.toISOString().slice(0, 16));

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.vehicleNumber) {
          setVehicleNumber(data.user.vehicleNumber);
        }
      })
      .catch(() => {});

    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      const res = await fetch('/api/parking/slots');
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (e) {
      console.error('Failed to load slots:', e);
    }
  };

  const pricePerHour = selectedSlot?.pricePerHour || 5.0;
  const totalAmount = duration * pricePerHour;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSlot) {
      setError('Please select an available parking slot from the map');
      return;
    }

    if (!vehicleNumber.trim()) {
      setError('Please enter your vehicle registration number');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          startTime,
          duration,
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to complete booking reservation');
      } else {
        setCreatedBooking(data.booking);
        setShowReceiptModal(true);
        loadSlots();
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Book a Parking Slot
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select an available green slot and schedule your reservation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Click any available (green) slot on the map below:</span>
            </div>
            {selectedSlot && (
              <span className="font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg">
                Selected: Slot {selectedSlot.slotNumber}
              </span>
            )}
          </div>

          <ParkingGrid
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={(slot) => {
              setSelectedSlot(slot);
              setError('');
            }}
            onRefresh={loadSlots}
            selectable={true}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Reservation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Chosen Parking Bay</span>
                    <span className="text-lg font-bold text-slate-900 font-heading">
                      {selectedSlot ? `Slot ${selectedSlot.slotNumber}` : 'No Slot Selected'}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {selectedSlot ? `${selectedSlot.floor} (${selectedSlot.vehicleType})` : 'Click a green slot on the left'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-medium block">Rate</span>
                    <span className="text-base font-bold text-blue-600 font-heading">
                      {selectedSlot ? `${formatCurrency(selectedSlot.pricePerHour)}/hr` : '$5.00/hr'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Entry / Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Duration (Hours)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 4, 8].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setDuration(hrs)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          duration === hrs
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {hrs} hr{hrs > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Vehicle Registration Number"
                  placeholder="e.g. NYC-4821"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  required
                  leftIcon={<Car className="w-4 h-4" />}
                />

                <div className="pt-4 border-t border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Base Hourly Rate</span>
                    <span>{formatCurrency(pricePerHour)} / hr</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Duration</span>
                    <span>{duration} hour(s)</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-100">
                    <span>Estimated Total</span>
                    <span className="text-blue-600 font-heading">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2"
                  size="lg"
                  isLoading={isLoading}
                  disabled={!selectedSlot}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Reserve Slot Now
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReceiptModal
        booking={createdBooking}
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          router.push('/booking-history');
        }}
      />
    </div>
  );
}
