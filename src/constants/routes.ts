export const DASHBOARD_ROUTES = {
  // Super Admin & Staff Dashboard
  MULTI_SCHOOL_DASHBOARD: '/dashboard',

  // School Management (Super Admin)
  SCHOOL_MANAGEMENT: '/schools',
  CREATE_SCHOOL: '/schools/create',
  SCHOOL_DETAILS: '/schools/:schoolId', // Using a dynamic route for school details
  SESSIONS: '/academic-settings/sessions',
  CLASSES: '/academic-settings/classes',

  // School View (Super Admin, Admin)
  SCHOOL_DASHBOARD: '/school-dashboard', // A school-specific dashboard
  INQUIRIES: '/school-dashboard/inquiries',
  RECENT_ADMISSIONS: '/school-dashboard/recent-admissions',

  // Academics
  ACADEMICS_OVERVIEW: '/academics',
  CLASS_SECTIONS: '/academics/class-sections',
  SUBJECTS: '/academics/subjects',
  TIMETABLE: '/academics/timetable',
  ATTENDANCE_STUDENT: '/academics/attendance/student',
  ATTENDANCE_STAFF: '/academics/attendance/staff',

  // Student Management
  STUDENT_ADMISSION: '/student/admissions',
  STUDENT_PROFILES: '/student/profiles',
  STUDENT_PROMOTION: '/student/promote',
  STUDENT_TRANSFER: '/student/transfer',

  // Staff Management (Super Admin, Admin)
  STAFF_REGISTRATION: '/staff-management/register',
  STAFF_LIST: '/staff-management/list',

  // Examinations
  EXAMS_MANAGE: '/examinations/manage',
  EXAMS_QUESTION_BANK: '/examinations/question-bank',
  EXAMS_RESULTS: '/examinations/results',
  EXAMS_GLOBAL_SETTINGS: '/examinations/global-settings',

  // Finance Management (Super Admin, Admin, Accountant)
  FINANCE_DASHBOARD: '/finance',
  FINANCE_FEE_MANAGEMENT: '/finance/fee-management',
  FINANCE_INVOICES: '/finance/invoices',
  FINANCE_PAYMENTS: '/finance/payments',
  FINANCE_EXPENSES: '/finance/expenses',

  // Notification & Mail
  NOTIFICATION_SEND: '/notifications/send',
  NOTIFICATION_VIEW: '/notifications/view',

  // Student & Parent Dashboard
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_EXAMS_CBT: '/student/examinations/cbt',
  STUDENT_FINANCE_MAKE_PAYMENT: '/student/finance/make-payment',
  STUDENT_NOTIFICATIONS: '/student/notifications',

  // Shared Routes
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_AUTHORIZED: '/not-authorized',
};
