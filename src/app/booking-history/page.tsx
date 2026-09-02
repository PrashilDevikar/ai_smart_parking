import React from 'react';
import { UserShell } from '@/components/layout/UserShell';
import BookingHistoryContent from '@/components/parking/BookingHistoryContent';

export default function Page() {
  return (
    <UserShell>
      <BookingHistoryContent />
    </UserShell>
  );
}
