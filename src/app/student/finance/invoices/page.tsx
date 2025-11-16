"use client";

import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import StudentInvoicesList from "@/components/student-dashboard/finance/StudentInvoicesList";

const InvoicesPage = () => {
  return (
    <div className="container mx-auto p-4">
      <StudentInvoicesList />
    </div>
  );
};

export default withAuth(InvoicesPage, [UserRole.STUDENT, UserRole.PARENT]);
