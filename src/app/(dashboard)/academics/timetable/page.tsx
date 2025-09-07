"use client";

import withAuth from '@/components/withAuth';
import { STAFF_ROLES } from '@/constants/roles';

const TimetablePage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Timetable</h1>
      <p>This page is currently under construction. Please check back later.</p>
    </div>
  );
};

export default withAuth(TimetablePage, STAFF_ROLES);
