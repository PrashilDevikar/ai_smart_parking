import React from 'react';
import { Car, Bike, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ParkingSlot } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';

export interface SlotCardProps {
  slot: ParkingSlot;
  isSelected?: boolean;
  onSelect?: (slot: ParkingSlot) => void;
  selectable?: boolean;
}

export function SlotCard({ slot, isSelected = false, onSelect, selectable = true }: SlotCardProps) {
  const isAvailable = slot.status === 'AVAILABLE';
  const isOccupied = slot.status === 'OCCUPIED';
  const isReserved = slot.status === 'RESERVED';

  const handleClick = () => {
    if (selectable && isAvailable && onSelect) {
      onSelect(slot);
    }
  };

  const getVehicleIcon = () => {
    switch (slot.vehicleType) {
      case 'BIKE': return <Bike className="w-4 h-4 text-slate-500" />;
      case 'EV': return <Zap className="w-4 h-4 text-emerald-600" />;
      default: return <Car className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between select-none',
        selectable && isAvailable && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        !isAvailable && 'cursor-not-allowed opacity-90',
        isSelected
          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
          : isAvailable
          ? 'bg-white border-emerald-200 hover:border-emerald-400'
          : isOccupied
          ? 'bg-red-50/40 border-red-200'
          : isReserved
          ? 'bg-amber-50/40 border-amber-200'
          : 'bg-slate-50 border-slate-200'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm font-heading">
            {slot.slotNumber}
          </div>
          <span className="text-[11px] font-medium text-slate-500">{slot.floor}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {getVehicleIcon()}
          {isSelected && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
          )}
        </div>
      </div>
      <div className="my-3">
        <Badge status={isSelected ? 'SELECTED' : slot.status} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-xs">
        <span className="text-slate-400 font-medium">{slot.vehicleType}</span>
        <span className="font-bold text-slate-800">{formatCurrency(slot.pricePerHour)}/hr</span>
      </div>
    </div>
  );
}
