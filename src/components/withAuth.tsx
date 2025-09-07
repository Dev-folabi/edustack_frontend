"use client";

import { usePermissions } from '@/utils/permissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/constants/roles';
import { DASHBOARD_ROUTES } from '@/constants/routes';

const withAuth = (WrappedComponent: React.ComponentType, requiredRoles: UserRole[]) => {
  const AuthComponent = (props: any) => {
    const { isSuperAdmin, hasRole } = usePermissions();
    const router = useRouter();

    // User has access if they have any of the required roles.
    const userHasAccess = requiredRoles.some(role => hasRole(role));

    useEffect(() => {
      // Super admin always has access.
      if (isSuperAdmin) {
        return;
      }

      if (!userHasAccess) {
        router.replace(DASHBOARD_ROUTES.NOT_AUTHORIZED);
      }
    }, [isSuperAdmin, userHasAccess, router]);

    if (isSuperAdmin || userHasAccess) {
      return <WrappedComponent {...props} />;
    }

    // Render nothing while redirecting
    return null;
  };

  return AuthComponent;
};

export default withAuth;
