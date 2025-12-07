"use client";

import { ProfilePage } from "@/components/profile/profile";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";

const StudentProfilePage = () => {
  return (
    <div className="container mx-auto p-4">
      <ProfilePage />
    </div>
  );
};

export default withAuth(StudentProfilePage, [
  UserRole.STUDENT,
  UserRole.PARENT,
]);
