'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, Car } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials') || authError.message.includes('Email not confirmed')) {
          const isDemoOperator = email.toLowerCase() === 'operator@aiparking.com';
          const isDemoUser = email.toLowerCase() === 'john@example.com';

          if (isDemoOperator || isDemoUser) {
            const role = isDemoOperator ? 'OPERATOR' : 'USER';
            const fullName = isDemoOperator ? 'Chief Operator' : 'John Doe';
            const phone = isDemoOperator ? '+1 555 9999' : '+1 555 0142';
            const vehicle = isDemoOperator ? 'ADMIN-01' : 'NYC-4821';

            const { data: upData, error: upError } = await supabase.auth.signUp({
              email: email.trim(),
              password: password,
              options: {
                data: { full_name: fullName, phone, vehicle_number: vehicle, role },
              },
            });

            if (!upError && upData.user) {
              setSuccess('Demo account initialized! Loading dashboard...');
              window.location.href = isDemoOperator ? '/operator/dashboard' : '/dashboard';
              return;
            }
          }
        }
        setError(authError.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        setSuccess('Authentication successful! Loading dashboard...');
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        const role = profile?.role || authData.user.user_metadata?.role || 'USER';
        const dest = role === 'OPERATOR' ? '/operator/dashboard' : '/dashboard';
        window.location.href = dest;
      }
    } catch (err: any) {
      setError(err?.message || 'Connection error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-blue-500/30">
          <Car className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          AI SMART PARKING
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to access real-time occupancy and slot reservations (Supabase Auth)
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
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 font-semibold"
              isLoading={isLoading}
              rightIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In with Supabase
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3 text-center">
              Quick 1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('operator@aiparking.com', 'Operator@123')}
                className="p-3 text-left rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 transition-all hover:scale-[1.02]"
              >
                <div className="font-bold text-purple-900 text-xs font-heading">Operator</div>
                <div className="text-[10px] text-purple-600 font-mono mt-0.5">operator@aiparking.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('john@example.com', 'User@123')}
                className="p-3 text-left rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 transition-all hover:scale-[1.02]"
              >
                <div className="font-bold text-emerald-900 text-xs font-heading">Customer</div>
                <div className="text-[10px] text-emerald-600 font-mono mt-0.5">john@example.com</div>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
