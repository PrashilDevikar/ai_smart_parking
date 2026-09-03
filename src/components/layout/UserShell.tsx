'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserSidebar } from './UserSidebar';
import { Header } from './Header';
import { User } from '@/types';

export function UserShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <UserSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
}
