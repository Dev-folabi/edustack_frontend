"use client";

import React from 'react';
import StudentHeader from '@/components/student-dashboard/StudentHeader';
import StudentSidebar from '@/components/student-dashboard/StudentSidebar';
import DashboardGuard from '@/components/DashboardGuard';
import { UserRole } from '@/constants/roles';

const StudentDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DashboardGuard requiredRoles={[UserRole.STUDENT, UserRole.PARENT]}>
      <div className="flex h-screen bg-gray-100">
        <StudentSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <StudentHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
};

export default StudentDashboardLayout;
