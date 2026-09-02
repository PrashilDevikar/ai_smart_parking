import React from 'react';
import { UserShell } from '@/components/layout/UserShell';
import BookSlotContent from '@/components/parking/BookSlotContent';

export default function Page() {
  return (
    <UserShell>
      <BookSlotContent />
    </UserShell>
  );
}
