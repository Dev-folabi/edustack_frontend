"use client";

import React from 'react';
import { CreateSessionForm } from '@/components/dashboard/sessions/CreateSessionForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';

const CreateSessionPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Academic Session</h1>
        <Link href={DASHBOARD_ROUTES.SESSIONS}>
          <Button variant="outline">Back to Sessions</Button>
        </Link>
      </div>
      <CreateSessionForm />
    </div>
  );
};

export default withAuth(CreateSessionPage, [UserRole.SUPER_ADMIN, UserRole.ADMIN]);
