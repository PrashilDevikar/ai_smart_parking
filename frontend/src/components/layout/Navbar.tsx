'use client';
import React from 'react';
import Link from 'next/link';
import { Car, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar({ user }: { user?: { fullName?: string; name?: string; role?: string; email?: string } | null }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Car className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5 font-heading">
            AI PARKING <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-blue-100 text-blue-700 rounded-md">Smart Hub</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/#hero" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link href="/#features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="/#statistics" className="hover:text-blue-600 transition-colors">Live Stats</Link>
          <Link href="/#about" className="hover:text-blue-600 transition-colors">About System</Link>
          <Link href="/#contact" className="hover:text-blue-600 transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href={user.role === 'OPERATOR' ? '/operator/dashboard' : '/dashboard'}>
              <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/register"><Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Get Started</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
