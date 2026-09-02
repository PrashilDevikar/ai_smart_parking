import React from 'react';
import { UserShell } from '@/components/layout/UserShell';
import LiveParkingContent from '@/components/parking/LiveParkingContent';

export default function Page() {
  return (
    <UserShell>
      <LiveParkingContent />
    </UserShell>
  );
}
