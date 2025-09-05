// Add these routes to your existing routes constants
export const DASHBOARD_ROUTES = {
  // Super Admin Routes
  MULTI_SCHOOL_DASHBOARD: '/dashboard',
  SCHOOL_MANAGEMENT: '/schools',
  CREATE_SCHOOL: '/schools/create',
  SCHOOL_DETAILS: '/schools/:schoolId',

  // School Admin Routes
  SCHOOL_DASHBOARD: '/school-dashboard',
  ACADEMIC_SETTINGS: '/academic-settings',
  SESSIONS_TERMS: '/academic-settings/sessions',
  CLASS_MANAGEMENT: '/class-management',

  // Shared Routes
  PROFILE: '/profile',
  SETTINGS: '/settings'
};
