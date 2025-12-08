"use client";

import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import StudentAttendanceView from "@/components/student-dashboard/academics/StudentAttendanceView";

const AttendancePage = () => {
  return (
    <div className="container mx-auto p-4">
      <StudentAttendanceView />
    </div>
  );
};

export default withAuth(AttendancePage, [UserRole.STUDENT, UserRole.PARENT]);
