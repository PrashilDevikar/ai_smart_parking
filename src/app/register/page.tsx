'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User, Phone, Car, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    vehicleNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // 1. Register with backend API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Background sync to Supabase Auth if needed
        try {
          await supabase.auth.signUp({
            email: formData.email.trim(),
            password: formData.password,
            options: {
              data: {
                full_name: formData.fullName.trim(),
                phone: formData.phone.trim(),
                vehicle_number: formData.vehicleNumber.toUpperCase().trim(),
                role: 'USER',
              },
            },
          });
        } catch {}

        setSuccess('Account created successfully! Loading your dashboard...');
        window.location.href = '/dashboard';
        return;
      }

      setError(data.error || 'Registration failed. Please try again.');
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-blue-500/30">
          <Car className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Create Driver Account
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Register to book smart parking bays in seconds
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-8 shadow-xl border-slate-200 bg-white rounded-3xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 555 0142"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Vehicle License Plate"
              type="text"
              placeholder="e.g. NYC-4821"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              required
              helperText="Pre-filled on your parking passes."
              leftIcon={<Car className="w-4 h-4" />}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full mt-4 font-semibold"
              isLoading={isLoading}
              rightIcon={<UserPlus className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:underline">
              Sign In here
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
