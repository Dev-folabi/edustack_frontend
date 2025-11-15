"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";

import ViewStudentAttendance from "@/components/dashboard/academics/attendance/ViewStudentAttendance";

const StudentAttendancePage = () => {
  return (
    <div className="container mx-auto p-4 max-w-full">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Student Attendance</h1>
          <ViewStudentAttendance />
    </div>
  );
};

export default withAuth(StudentAttendancePage, [
  UserRole.STUDENT,
  UserRole.PARENT,
]);
