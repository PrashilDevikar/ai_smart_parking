import React from 'react';
import { UserShell } from '@/components/layout/UserShell';
import ProfileContent from '@/components/parking/ProfileContent';

export default function Page() {
  return (
    <UserShell>
      <ProfileContent />
    </UserShell>
  );
}
