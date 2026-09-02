'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FLOORS, VEHICLE_TYPES, SLOT_STATUSES } from '@/lib/slot-polygons';
import { formatCurrency } from '@/lib/utils';
import {
  Grid3X3,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function OperatorSlotsContent() {
  const [slots, setSlots] = useState<any[]>([]);
  const [floorFilter, setFloorFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<any | null>(null);

  const [addForm, setAddForm] = useState({
    slotNumber: '',
    floor: 'Ground Floor',
    vehicleType: 'CAR',
    pricePerHour: 5.0,
    status: 'AVAILABLE',
  });

  const [editForm, setEditForm] = useState({
    id: '',
    slotNumber: '',
    floor: 'Ground Floor',
    vehicleType: 'CAR',
    pricePerHour: 5.0,
    status: 'AVAILABLE',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/operator/slots');
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (e) {
      console.error('Failed to load operator slots:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await fetch('/api/operator/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: `Slot ${addForm.slotNumber.toUpperCase()} added successfully!` });
        setIsAddModalOpen(false);
        setAddForm({ slotNumber: '', floor: 'Ground Floor', vehicleType: 'CAR', pricePerHour: 5.0, status: 'AVAILABLE' });
        fetchSlots();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to add slot' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Network error while adding slot' });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await fetch('/api/operator/slots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: `Slot ${editForm.slotNumber} updated successfully!` });
        setIsEditModalOpen(false);
        fetchSlots();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to update slot' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Network error while updating slot' });
    }
  };

  const handleDeleteSlot = async () => {
    if (!currentSlot) return;
    setFeedback(null);
    try {
      const res = await fetch(`/api/operator/slots?id=${currentSlot.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: `Slot ${currentSlot.slotNumber} deleted successfully!` });
        setIsDeleteModalOpen(false);
        fetchSlots();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to delete slot' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Network error while deleting slot' });
    }
  };

  const openEditModal = (slot: any) => {
    setCurrentSlot(slot);
    setEditForm({
      id: slot.id,
      slotNumber: slot.slotNumber,
      floor: slot.floor,
      vehicleType: slot.vehicleType,
      pricePerHour: slot.pricePerHour,
      status: slot.status,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (slot: any) => {
    setCurrentSlot(slot);
    setIsDeleteModalOpen(true);
  };

  const filtered = slots.filter((s) => {
    const matchFloor = floorFilter === 'ALL' || s.floor === floorFilter;
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchSearch = s.slotNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFloor && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Parking Slot Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Add new parking bays, calibrate rates per hour, or toggle slot maintenance mode.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchSlots} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add Parking Slot
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Floors</option>
            {FLOORS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            {SLOT_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search slot (e.g. A1)..."
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
                <th className="px-6 py-3.5">Slot Number</th>
                <th className="px-6 py-3.5">Floor Level</th>
                <th className="px-6 py-3.5">Vehicle Type</th>
                <th className="px-6 py-3.5">Hourly Rate</th>
                <th className="px-6 py-3.5">Current Status</th>
                <th className="px-6 py-3.5">Active Reservations</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Grid3X3 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No parking slots found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 font-heading text-sm">{slot.slotNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{slot.floor}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{slot.vehicleType}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{formatCurrency(slot.pricePerHour)}/hr</td>
                    <td className="px-6 py-4"><Badge status={slot.status} /></td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-600">{slot._count?.bookings ?? 0} active</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEditModal(slot)} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit Slot">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteModal(slot)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete Slot">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Parking Slot" maxWidth="md">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input label="Slot Number" placeholder="e.g. A9, B9, D1" value={addForm.slotNumber} onChange={(e) => setAddForm({ ...addForm, slotNumber: e.target.value })} required />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Level</label>
            <select value={addForm.floor} onChange={(e) => setAddForm({ ...addForm, floor: e.target.value })} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white">
              {FLOORS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
              <select value={addForm.vehicleType} onChange={(e) => setAddForm({ ...addForm, vehicleType: e.target.value })} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white">
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price Per Hour ($)</label>
              <input type="number" step="0.5" min="0.5" value={addForm.pricePerHour} onChange={(e) => setAddForm({ ...addForm, pricePerHour: parseFloat(e.target.value) || 5.0 })} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
            <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white">
              {SLOT_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-3">
            <Button type="button" variant="outline" className="w-full" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="w-full">Add Slot</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Slot ${editForm.slotNumber}`} maxWidth="md">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Slot Number" value={editForm.slotNumber} onChange={(e) => setEditForm({ ...editForm, slotNumber: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Level</label>
              <select value={editForm.floor} onChange={(e) => setEditForm({ ...editForm, floor: e.target.value })} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white">
                {FLOORS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
              <select value={editForm.vehicleType} onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white">
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price Per Hour ($)</label>
              <input type="number" step="0.5" min="0.5" value={editForm.pricePerHour} onChange={(e) => setEditForm({ ...editForm, pricePerHour: parseFloat(e.target.value) || 5.0 })} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Slot Status</label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white">
                {SLOT_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3">
            <Button type="button" variant="outline" className="w-full" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="w-full">Save Changes</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Slot Deletion" maxWidth="sm">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Delete Slot {currentSlot?.slotNumber}?</h4>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this parking slot? Slots with active reservations cannot be deleted.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" className="w-full" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" className="w-full" onClick={handleDeleteSlot}>Delete Slot</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
