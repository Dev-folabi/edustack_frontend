"use client";

import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { StudentTable } from '@/components/dashboard/student-management/StudentTable';

const StudentProfilesPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Profiles</h1>
      <p className="text-muted-foreground mb-4">
        Browse, search, and manage student profiles.
      </p>
      <StudentTable />
    </div>
  );
};

export default withAuth(StudentProfilesPage, [UserRole.ADMIN, UserRole.TEACHER]);
