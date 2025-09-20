"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Loader } from '@/components/ui/Loader';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { initializeAuth, isHydrated } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isHydrated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex flex-col items-center justify-center gap-4">
                <Loader />
                <p className="text-gray-600 text-sm font-medium">Checking system status...</p>
            </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
