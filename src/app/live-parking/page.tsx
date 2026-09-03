import React from 'react';
import { UserShell } from '@/components/layout/UserShell';
import { OperatorShell } from '@/components/layout/OperatorShell';
import LiveParkingContent from '@/components/parking/LiveParkingContent';
import { getCurrentUser } from '@/lib/session';

export default async function Page() {
  const user = await getCurrentUser();
  const isOperator = user?.role === 'OPERATOR';

  if (isOperator) {
    return (
      <OperatorShell>
        <LiveParkingContent />
      </OperatorShell>
    );
  }

  return (
    <UserShell>
      <LiveParkingContent />
    </UserShell>
  );
}
