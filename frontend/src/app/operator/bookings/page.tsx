import React from 'react';
import { OperatorShell } from '@/components/layout/OperatorShell';
import OperatorBookingsContent from '@/components/parking/OperatorBookingsContent';

export default function Page() {
  return (
    <OperatorShell>
      <OperatorBookingsContent />
    </OperatorShell>
  );
}
