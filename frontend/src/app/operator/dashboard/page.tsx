import React from 'react';
import { OperatorShell } from '@/components/layout/OperatorShell';
import OperatorDashboardContent from '@/components/parking/OperatorDashboardContent';

export default function Page() {
  return (
    <OperatorShell>
      <OperatorDashboardContent />
    </OperatorShell>
  );
}
