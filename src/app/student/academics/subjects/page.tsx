"use client";

import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import StudentSubjectsList from "@/components/student-dashboard/academics/StudentSubjectsList";

const SubjectsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <StudentSubjectsList />
    </div>
  );
};

export default withAuth(SubjectsPage, [UserRole.STUDENT, UserRole.PARENT]);
