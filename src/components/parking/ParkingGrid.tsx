'use client';
import React, { useState } from 'react';
import { ParkingSlot } from '@/types';
import { SlotCard } from './SlotCard';
import { FLOORS } from '@/lib/slot-polygons';
import { cn } from '@/lib/utils';
import { Layers, RefreshCw } from 'lucide-react';

export interface ParkingGridProps {
  slots: ParkingSlot[];
  selectedSlot?: ParkingSlot | null;
  onSelectSlot?: (slot: ParkingSlot) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  selectable?: boolean;
}

export function ParkingGrid({
  slots = [],
  selectedSlot,
  onSelectSlot,
  isLoading = false,
  onRefresh,
  selectable = true,
}: ParkingGridProps) {
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground Floor');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredSlots = slots.filter((slot) => {
    const matchFloor = selectedFloor === 'ALL' || slot.floor === selectedFloor;
    const matchType = filterType === 'ALL' || slot.vehicleType === filterType;
    return matchFloor && matchType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {FLOORS.map((floor) => (
            <button
              key={floor}
              type="button"
              onClick={() => setSelectedFloor(floor)}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
                selectedFloor === floor ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {floor}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedFloor('ALL')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              selectedFloor === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            All Floors
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Vehicle Types</option>
            <option value="CAR">Cars Only</option>
            <option value="BIKE">Motorcycles Only</option>
            <option value="EV">EV Stations</option>
          </select>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh Slots"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin text-blue-600')} />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 px-3 py-2 text-xs text-slate-600 bg-slate-50/80 rounded-xl border border-slate-200/60 font-medium">
        <span className="text-slate-400 font-semibold uppercase text-[10px]">Legend:</span>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Available</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span>Occupied</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span>Reserved</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span>Selected</span></div>
      </div>
      {filteredSlots.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No parking slots found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {filteredSlots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} isSelected={selectedSlot?.id === slot.id} onSelect={onSelectSlot} selectable={selectable} />
          ))}
        </div>
      )}
    </div>
  );
}
