import { useAuthStore } from '@/store/authStore';
import { UserRole, STAFF_ROLES } from '@/constants/roles';

/**
 * Checks if the current user is a Super Admin.
 * @returns {boolean} - True if the user is a Super Admin, false otherwise.
 */
export const isSuperAdmin = (): boolean => {
  const { user } = useAuthStore.getState();
  return user?.isSuperAdmin === true;
};

/**
 * Gets the current user's role for the currently selected school.
 * @returns {UserRole | null} - The user's role for the selected school, or null if not available.
 */
export const getCurrentSchoolRole = (): UserRole | null => {
  const { userSchools, selectedSchool } = useAuthStore.getState();
  if (!selectedSchool || !userSchools) {
    return null;
  }
  const schoolRole = userSchools.find(us => us.schoolId === selectedSchool.schoolId);
  return schoolRole ? (schoolRole.role as UserRole) : null;
};

/**
 * Checks if the current user has a specific role in the selected school.
 * For Super Admins, this will always return true.
 * @param {UserRole} role - The role to check for.
 * @returns {boolean} - True if the user has the role, false otherwise.
 */
export const hasRole = (role: UserRole): boolean => {
  if (isSuperAdmin()) {
    return true;
  }
  const currentRole = getCurrentSchoolRole();
  return currentRole === role;
};

/**
 * Checks if the current user is considered a staff member.
 * This includes all roles defined in the STAFF_ROLES constant.
 * @returns {boolean} - True if the user is a staff member, false otherwise.
 */
export const isStaff = (): boolean => {
  const currentRole = getCurrentSchoolRole();
  if (!currentRole) {
    return false;
  }
  return STAFF_ROLES.includes(currentRole);
};

/**
 * A comprehensive hook to get all permission-related data at once.
 * This is useful for components that need to check multiple permissions.
 */
export const usePermissions = () => {
  const { user, selectedSchool } = useAuthStore();

  const superAdmin = user?.isSuperAdmin === true;

  const currentRole = selectedSchool
    ? (user?.userSchools?.find(us => us.schoolId === selectedSchool.schoolId)?.role as UserRole | null)
    : null;

  const checkRole = (role: UserRole): boolean => {
    if (superAdmin) return true;
    return currentRole === role;
  };

  const staff = currentRole ? STAFF_ROLES.includes(currentRole) : false;

  return {
    isSuperAdmin: superAdmin,
    currentRole,
    hasRole: checkRole,
    isStaff: staff,
    // Add more specific role checks if needed for convenience
    isAdmin: checkRole(UserRole.ADMIN),
    isTeacher: checkRole(UserRole.TEACHER),
    isFinance: checkRole(UserRole.FINANCE),
    isLibrarian: checkRole(UserRole.LIBRARIAN),
  };
};
