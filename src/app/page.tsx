import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  Car,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  BarChart3,
  MapPin,
  Users,
  Eye,
  Sparkles,
  Send,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const user = await getCurrentUser();

  let totalSlots = 24;
  let totalUsers = 4;
  let parkingLocations = 1;

  try {
    const { count: sCount } = await supabaseAdmin.from('parking_slots').select('*', { count: 'exact', head: true });
    if (sCount) totalSlots = sCount;

    const { count: uCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'USER');
    if (uCount) totalUsers = uCount;

    const { count: lCount } = await supabaseAdmin.from('parking_locations').select('*', { count: 'exact', head: true });
    if (lCount) parkingLocations = lCount;
  } catch (e) {}

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={user} />
      <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Powered by YOLOv8 Computer Vision & OpenCV</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight font-heading">
                Find Parking Easily <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  with AI Vision
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Smart, secure and convenient parking powered by artificial intelligence. Real-time slot detection, zero hardware sensors required, instant reservations, and seamless operator analytics.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href={user ? '/dashboard' : '/register'} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    {user ? 'Open Dashboard' : 'Get Started Free'}
                  </Button>
                </Link>
                <Link href="/live-parking" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto" leftIcon={<Eye className="w-4 h-4" />}>
                    View Live AI Camera
                  </Button>
                </Link>
              </div>
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 93%+ YOLO Detection</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Anti-Conflict Booking</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Role-Based Access Control</span>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-slate-900 p-4 shadow-2xl border border-slate-800 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 live-indicator" />
                    <span className="font-semibold font-mono">CAM-01 • AI VISION FEED</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold font-mono">YOLOv8</span>
                </div>
                <div className="grid grid-cols-4 gap-2.5 py-2">
                  <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-center"><span className="text-[10px] text-red-400 block font-bold">A1</span><span className="text-xs font-bold text-red-300">BUSY</span></div>
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-center"><span className="text-[10px] text-emerald-400 block font-bold">A2</span><span className="text-xs font-bold text-emerald-300">FREE</span></div>
                  <div className="p-3 bg-amber-950/60 border border-amber-500/50 rounded-xl text-center"><span className="text-[10px] text-amber-400 block font-bold">A3</span><span className="text-xs font-bold text-amber-300">RESV</span></div>
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-center"><span className="text-[10px] text-emerald-400 block font-bold">A4</span><span className="text-xs font-bold text-emerald-300">FREE</span></div>
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-center"><span className="text-[10px] text-emerald-400 block font-bold">A5</span><span className="text-xs font-bold text-emerald-300">FREE</span></div>
                  <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-center"><span className="text-[10px] text-red-400 block font-bold">A6</span><span className="text-xs font-bold text-red-300">BUSY</span></div>
                  <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-center"><span className="text-[10px] text-red-400 block font-bold">A7</span><span className="text-xs font-bold text-red-300">BUSY</span></div>
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-center"><span className="text-[10px] text-emerald-400 block font-bold">A8</span><span className="text-xs font-bold text-emerald-300">FREE</span></div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Rate: <strong className="text-blue-400">62.5%</strong></span>
                  <span className="text-slate-400">Latency: <strong className="text-emerald-400">18ms</strong></span>
                  <span className="text-slate-400">Conf: <strong className="text-amber-400">94%</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
