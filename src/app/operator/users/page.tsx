import React from 'react';
import { OperatorShell } from '@/components/layout/OperatorShell';
import OperatorUsersContent from '@/components/parking/OperatorUsersContent';

export default function Page() {
  return (
    <OperatorShell>
      <OperatorUsersContent />
    </OperatorShell>
  );
}
