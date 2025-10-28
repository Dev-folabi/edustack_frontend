"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { InvoicesTable } from '@/components/dashboard/finance/InvoicesTable';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';

const FeeManagementPage = () => {
    const router = useRouter();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={() => router.push('/finance/fee-management/fee-types')}>
          Manage Fee Types
        </Button>
      </div>
      <InvoicesTable />
    </div>
  );
};

export default withAuth(FeeManagementPage, [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE]);
