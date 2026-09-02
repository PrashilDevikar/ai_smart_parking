import React from 'react';
import { OperatorShell } from '@/components/layout/OperatorShell';
import OperatorSlotsContent from '@/components/parking/OperatorSlotsContent';

export default function Page() {
  return (
    <OperatorShell>
      <OperatorSlotsContent />
    </OperatorShell>
  );
}
