"use client";

import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import SubjectsList from '@/app/(dashboard)/academics/subjects/SubjectsList';

const SubjectsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <SubjectsList />
    </div>
  );
};

export default withAuth(SubjectsPage, [UserRole.STUDENT, UserRole.PARENT]);
