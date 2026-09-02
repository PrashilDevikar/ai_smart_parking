import React from 'react';
import Link from 'next/link';
import { Car, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight font-heading">AI PARKING</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-Stack Smart Parking Management System with real-time YOLO computer vision vehicle detection and reservation scheduling.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-heading">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/#features" className="hover:text-white transition-colors">AI Features</Link></li>
              <li><Link href="/#statistics" className="hover:text-white transition-colors">Real-time Stats</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-heading">Portals</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/login" className="hover:text-white transition-colors">User Portal</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Operator Dashboard</Link></li>
              <li><Link href="/live-parking" className="hover:text-white transition-colors">Live AI Camera</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-heading">Demo Credentials</h4>
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 text-xs space-y-2">
              <div>
                <span className="text-slate-400 block font-semibold text-[11px]">Operator:</span>
                <span className="text-blue-400 font-mono">operator@aiparking.com / Operator@123</span>
              </div>
              <div className="pt-1 border-t border-slate-700">
                <span className="text-slate-400 block font-semibold text-[11px]">Customer:</span>
                <span className="text-emerald-400 font-mono">john@example.com / User@123</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AI Smart Parking Management System. Final-Year Project.</p>
        </div>
      </div>
    </footer>
  );
}
