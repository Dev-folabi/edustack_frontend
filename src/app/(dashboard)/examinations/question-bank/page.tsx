"use client";

import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';

const QuestionBankPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Question Bank</h1>
      <p>This page is currently under construction. Please check back later.</p>
    </div>
  );
};

export default withAuth(QuestionBankPage, [UserRole.ADMIN, UserRole.TEACHER]);
