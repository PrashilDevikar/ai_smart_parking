import React from 'react';
import { UserShell } from '@/components/layout/UserShell';
import UserDashboardContent from '@/components/parking/UserDashboardContent';

export default function Page() {
  return (
    <UserShell>
      <UserDashboardContent />
    </UserShell>
  );
}
