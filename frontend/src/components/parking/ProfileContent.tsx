'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import {
  User,
  Phone,
  Car,
  Mail,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Save,
  RefreshCw,
} from 'lucide-react';

export default function ProfileContent() {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    vehicleNumber: '',
  });

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
          setFormData({
            fullName: data.user.fullName || '',
            phone: data.user.phone || '',
            vehicleNumber: data.user.vehicleNumber || '',
          });
        }
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ type: 'success', text: 'Your profile details have been saved successfully!' });
        setProfile(data.user);
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (e) {
      setProfileMsg({ type: 'error', text: 'Network error while saving changes' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Account Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View and manage your registered driver information and vehicle details.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchProfile}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh Profile
        </Button>
      </div>

      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-3xl font-heading shadow-inner border border-white/30">
            {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold mb-1 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{profile?.role === 'OPERATOR' ? 'Facility Operator' : 'Registered Driver'}</span>
            </div>
            <h3 className="text-2xl font-bold font-heading">{profile?.fullName || 'Customer Profile'}</h3>
            <p className="text-xs md:text-sm text-blue-100 font-mono mt-0.5">{profile?.email || 'driver@example.com'}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-blue-200 justify-center sm:justify-start">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Member since {profile?.createdAt ? formatDate(profile.createdAt) : '2026'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center">
          <div>
            <span className="text-[11px] text-blue-200 block font-medium uppercase tracking-wider">Account Status</span>
            <span className="text-sm font-bold text-emerald-300">● {profile?.status || 'ACTIVE'}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <span className="text-[11px] text-blue-200 block font-medium uppercase tracking-wider">Total Bookings</span>
            <span className="text-lg font-bold font-heading">{profile?.totalBookings ?? 0}</span>
          </div>
        </div>
      </div>

      {profileMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
            profileMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {profileMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{profileMsg.text}</span>
        </div>
      )}

      {/* Profile Details Form */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal & Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Email Address"
                value={profile?.email || ''}
                disabled
                helperText="Email is permanently linked to your account."
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Contact Phone Number"
                placeholder="+1 555 0142"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Default Vehicle Plate Number"
                placeholder="e.g. NYC-4821"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                helperText="Pre-filled automatically when reserving parking slots."
                leftIcon={<Car className="w-4 h-4" />}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto px-8"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}