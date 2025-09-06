"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

const AuthSync = () => {
  const { initializeAuth, token } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Sync token to cookie whenever it changes
    if (token) {
      // Set cookie with 7 days expiry
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    } else {
      // Clear cookie if no token
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }, [token]);

  return null;
};

export default AuthSync;