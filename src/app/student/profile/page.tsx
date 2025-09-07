"use client";

import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';

const StudentProfilePage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold">My Profile</h1>
      <p>This page will display student and parent information. This page is under construction.</p>
    </div>
  );
};

export default withAuth(StudentProfilePage, [UserRole.STUDENT, UserRole.PARENT]);
