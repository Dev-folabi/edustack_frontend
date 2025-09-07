"use client";

import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';

const StudentProfilesPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Student Profiles</h1>
      <p>This page is currently under construction. Please check back later.</p>
    </div>
  );
};

export default withAuth(StudentProfilesPage, [UserRole.ADMIN, UserRole.TEACHER]);
