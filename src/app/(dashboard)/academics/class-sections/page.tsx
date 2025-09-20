"use client";

import withAuth from '@/components/withAuth';
import { STAFF_ROLES } from '@/constants/roles';
import { ClassList } from '@/components/dashboard/classes/ClassList';

const ClassSectionsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <ClassList />
    </div>
  );
};

export default withAuth(ClassSectionsPage, STAFF_ROLES);
