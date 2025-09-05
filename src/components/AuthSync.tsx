'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthSync() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth state from localStorage and sync with cookies
    initializeAuth();
  }, [initializeAuth]);

  return null; // This component doesn't render anything
}