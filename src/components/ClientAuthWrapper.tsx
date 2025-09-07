"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Loader } from "lucide-react";

interface ClientAuthWrapperProps {
  children: React.ReactNode;
}

export default function ClientAuthWrapper({ children }: ClientAuthWrapperProps) {
  const { initializeAuth } = useAuthStore();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
    setIsAuthInitialized(true);
  }, [initializeAuth]);

  if (!isAuthInitialized) {
    return <div className="h-16 flex items-center justify-end px-4 sm:px-6 lg:px-8"><Loader className="animate-spin" /></div>;
  }

  return <>{children}</>;
}
