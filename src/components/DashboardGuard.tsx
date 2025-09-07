"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/constants/roles';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/utils/permissions';
import { Loader } from './ui/Loader';

interface DashboardGuardProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
}

const DashboardGuard = ({ children, requiredRoles }: DashboardGuardProps) => {
  const { isInitialized, token } = useAuthStore(state => ({
    isInitialized: state.isInitialized,
    token: state.token
  }));

  const { isSuperAdmin, hasRole } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!token) {
      router.replace('/login');
      return;
    }

    const userHasAccess = requiredRoles.some(role => hasRole(role));
    if (!isSuperAdmin && !userHasAccess) {
      router.replace(DASHBOARD_ROUTES.NOT_AUTHORIZED);
    }

  }, [isInitialized, token, isSuperAdmin, hasRole, router, requiredRoles]);

  if (!isInitialized) {
    return <Loader fullScreen text="Authenticating..." />;
  }

  if (!token) {
    return <Loader fullScreen text="Redirecting..." />;
  }

  const userHasAccess = requiredRoles.some(role => hasRole(role));
  if (isSuperAdmin || userHasAccess) {
    return <>{children}</>;
  }

  return <Loader fullScreen text="Checking permissions..." />;
};

export default DashboardGuard;
