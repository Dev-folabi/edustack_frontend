"use client";

import withAuth from '@/components/withAuth';
import { STAFF_ROLES } from '@/constants/roles';

const ClassSectionsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Class Sections</h1>
      <p>This page is currently under construction. Please check back later.</p>
    </div>
  );
};

export default withAuth(ClassSectionsPage, STAFF_ROLES);
