"use client";

import React from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { NotificationBanner } from '@/components/dashboard/NotificationBanner';
import DashboardGuard from '@/components/DashboardGuard';
import { STAFF_ROLES } from '@/constants/roles';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <DashboardGuard requiredRoles={STAFF_ROLES}>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NotificationBanner />
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
};

export default DashboardLayout;
