"use client";

import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';

const MakePaymentPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold">Make a Payment</h1>
      <p>This page will be used for making payments. This page is under construction.</p>
    </div>
  );
};

export default withAuth(MakePaymentPage, [UserRole.STUDENT, UserRole.PARENT]);
