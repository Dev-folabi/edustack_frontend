"use client";

import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';

const CBTPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold">CBT Exam</h1>
      <p>This page will be used for taking Computer-Based Tests. This page is under construction.</p>
    </div>
  );
};

export default withAuth(CBTPage, [UserRole.STUDENT, UserRole.PARENT]);
