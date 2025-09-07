"use client";

import withAuth from '@/components/withAuth';
import { STAFF_ROLES } from '@/constants/roles';

const SubjectsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Subjects</h1>
      <p>This page is currently under construction. Please check back later.</p>
    </div>
  );
};

export default withAuth(SubjectsPage, STAFF_ROLES);
