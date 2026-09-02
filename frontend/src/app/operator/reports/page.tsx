import React from 'react';
import { OperatorShell } from '@/components/layout/OperatorShell';
import OperatorReportsContent from '@/components/parking/OperatorReportsContent';

export default function Page() {
  return (
    <OperatorShell>
      <OperatorReportsContent />
    </OperatorShell>
  );
}
