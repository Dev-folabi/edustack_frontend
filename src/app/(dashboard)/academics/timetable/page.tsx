"use client";

import withAuth from '@/components/withAuth';
import { STAFF_ROLES, UserRole } from '@/constants/roles';
import { usePermissions } from '@/utils/permissions';

const TimetablePage = () => {
  const { hasRole } = usePermissions();

  const isStudentOrParent = hasRole(UserRole.STUDENT) || hasRole(UserRole.PARENT);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Timetable</h1>
      {isStudentOrParent ? (
        <div>
          <h2 className="text-xl font-semibold">Student Timetable View</h2>
          <p>This is the simplified timetable view for students and parents. This page is under construction.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold">Staff Timetable View</h2>
          <p>This is the staff view for managing timetables. This page is under construction.</p>
        </div>
      )}
    </div>
  );
};

export default withAuth(TimetablePage, [...STAFF_ROLES, UserRole.STUDENT, UserRole.PARENT]);
