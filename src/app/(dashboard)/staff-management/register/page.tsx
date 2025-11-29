"use client";

import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import StaffRegistrationForm from "@/components/dashboard/staff-management/StaffRegistrationForm";

const RegisterStaffPage = () => {
  return (
    <div className="w-full">
      <StaffRegistrationForm />
    </div>
  );
};

export default withAuth(RegisterStaffPage, [UserRole.ADMIN]);
