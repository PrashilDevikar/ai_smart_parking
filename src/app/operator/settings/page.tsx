import React from 'react';
import { OperatorShell } from '@/components/layout/OperatorShell';
import OperatorSettingsContent from '@/components/parking/OperatorSettingsContent';

export default function Page() {
  return (
    <OperatorShell>
      <OperatorSettingsContent />
    </OperatorShell>
  );
}
