"use client";

import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import StudentTimetable from "@/components/student-dashboard/academics/StudentTimetable";

const TimetablePage = () => {
  return (
    <div className="container mx-auto p-4">
      <StudentTimetable />
    </div>
  );
};

export default withAuth(TimetablePage, [UserRole.STUDENT, UserRole.PARENT]);
