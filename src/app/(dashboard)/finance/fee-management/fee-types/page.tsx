"use client";

import { FeeTypesTable } from '@/components/dashboard/finance/FeeTypesTable';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';

const FeeTypesPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fee Types Management</h1>
      <FeeTypesTable />
    </div>
  );
};

export default withAuth(FeeTypesPage, [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE]);
