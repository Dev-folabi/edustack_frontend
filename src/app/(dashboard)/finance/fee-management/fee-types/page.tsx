"use client";

import { FeeTypesTable } from "@/components/dashboard/finance/FeeTypesTable";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { BackButton } from "@/components/ui/BackButton";

const FeeTypesPage = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Fee Types Management</h1>
      </div>
      <FeeTypesTable />
    </div>
  );
};

export default withAuth(FeeTypesPage, [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.FINANCE,
]);
