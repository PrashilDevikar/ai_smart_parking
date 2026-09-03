import React from 'react';
import { OperatorShell } from '@/components/layout/OperatorShell';
import LiveParkingContent from '@/components/parking/LiveParkingContent';

export default function OperatorLiveParkingPage() {
  return (
    <OperatorShell>
      <LiveParkingContent />
    </OperatorShell>
  );
}
