"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

const AuthInitializer = () => {
  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  return null;
};

export default AuthInitializer;
