"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { NotificationBanner } from '@/components/dashboard/NotificationBanner';
import { Loader } from '@/components/ui/Loader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, token, isLoading, initializeAuth } = useAuthStore();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth on mount
    initializeAuth();
    setIsInitialized(true);
  }, [initializeAuth]);

  useEffect(() => {
    // Redirect to login if not authenticated after initialization
    if (isInitialized && !isLoading && (!user || !token)) {
      router.push('/login');
    }
  }, [user, token, isLoading, isInitialized, router]);

  // Show loading while initializing or checking auth
  if (!isInitialized || isLoading || !user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <NotificationBanner />
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
