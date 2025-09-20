"use client";

import withAuth from '@/components/withAuth';
import { STAFF_ROLES } from '@/constants/roles';
import SubjectsList from './SubjectsList';

const SubjectsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <SubjectsList />
    </div>
  );
};

export default withAuth(SubjectsPage, STAFF_ROLES);
