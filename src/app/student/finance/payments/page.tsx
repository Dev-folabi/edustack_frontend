"use client";

import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import StudentPaymentsList from "@/components/student-dashboard/finance/StudentPaymentsList";

const PaymentsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <StudentPaymentsList />
    </div>
  );
};

export default withAuth(PaymentsPage, [UserRole.STUDENT, UserRole.PARENT]);
