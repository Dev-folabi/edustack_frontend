import {
  FaTachometerAlt, FaSchool, FaBook, FaUsers, FaUserGraduate,
  FaUserTie, FaClipboardList, FaFileInvoiceDollar, FaCog, FaEnvelope, FaUserCircle
} from 'react-icons/fa';
import { UserRole } from './roles';
import { DASHBOARD_ROUTES } from './routes';
import { IconType } from 'react-icons';

export interface SidebarLink {
  href: string;
  label: string;
  icon: IconType;
  roles: UserRole[];
  isStaff?: boolean;
  allAuthenticated?: boolean;
}

export interface SidebarCategory {
  title: string;
  links: SidebarLink[];
  roles: UserRole[];
  isStaff?: boolean;
  allAuthenticated?: boolean;
}

export const sidebarConfig: SidebarCategory[] = [
  {
    title: 'Dashboard',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    links: [
      {
        href: DASHBOARD_ROUTES.MULTI_SCHOOL_DASHBOARD,
        label: 'System Dashboard',
        icon: FaTachometerAlt,
        roles: [UserRole.SUPER_ADMIN],
      },
      {
        href: DASHBOARD_ROUTES.SCHOOL_DASHBOARD,
        label: 'School Dashboard',
        icon: FaTachometerAlt,
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    title: 'School Management',
    roles: [UserRole.SUPER_ADMIN],
    links: [
      {
        href: DASHBOARD_ROUTES.SCHOOL_MANAGEMENT,
        label: 'Schools',
        icon: FaSchool,
        roles: [UserRole.SUPER_ADMIN],
      },
      {
        href: DASHBOARD_ROUTES.SESSIONS,
        label: 'Sessions & Terms',
        icon: FaBook,
        roles: [UserRole.SUPER_ADMIN],
      },
      {
        href: DASHBOARD_ROUTES.CLASSES,
        label: 'Classes',
        icon: FaUsers,
        roles: [UserRole.SUPER_ADMIN],
      },
    ],
  },
  {
    title: 'Academics',
    isStaff: true,
    roles: [UserRole.ADMIN],
    links: [
      {
        href: DASHBOARD_ROUTES.ACADEMICS_OVERVIEW,
        label: 'Overview',
        icon: FaBook,
        roles: [UserRole.ADMIN],
      },
      {
        href: DASHBOARD_ROUTES.CLASS_SECTIONS,
        label: 'Class Sections',
        icon: FaUsers,
        isStaff: true,
        roles: [],
      },
      {
        href: DASHBOARD_ROUTES.SUBJECTS,
        label: 'Subjects',
        icon: FaBook,
        isStaff: true,
        roles: [],
      },
      {
        href: DASHBOARD_ROUTES.TIMETABLE,
        label: 'Timetable',
        icon: FaClipboardList,
        isStaff: true,
        roles: [],
      },
      {
        href: DASHBOARD_ROUTES.ATTENDANCE_STUDENT,
        label: 'Student Attendance',
        icon: FaUserGraduate,
        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER],
      },
      {
        href: DASHBOARD_ROUTES.ATTENDANCE_STAFF,
        label: 'Staff Attendance',
        icon: FaUserTie,
        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER],
      },
    ],
  },
  {
    title: 'Student Management',
    isStaff: true,
    roles: [UserRole.ADMIN, UserRole.TEACHER],
    links: [
      {
        href: DASHBOARD_ROUTES.STUDENT_ADMISSION,
        label: 'Admission',
        icon: FaUserGraduate,
        roles: [UserRole.ADMIN],
      },
      {
        href: DASHBOARD_ROUTES.STUDENT_PROFILES,
        label: 'Student Profiles',
        icon: FaUsers,
        roles: [UserRole.ADMIN, UserRole.TEACHER],
      },
      {
        href: DASHBOARD_ROUTES.STUDENT_PROMOTION,
        label: 'Promote Students',
        icon: FaUserGraduate,
        roles: [UserRole.ADMIN, UserRole.TEACHER],
      },
      {
        href: DASHBOARD_ROUTES.STUDENT_TRANSFER,
        label: 'Transfer Students',
        icon: FaUserGraduate,
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    title: 'Staff Management',
    roles: [UserRole.ADMIN],
    links: [
      {
        href: DASHBOARD_ROUTES.STAFF_REGISTRATION,
        label: 'Register Staff',
        icon: FaUserTie,
        roles: [UserRole.ADMIN],
      },
      {
        href: DASHBOARD_ROUTES.STAFF_LIST,
        label: 'Staff List',
        icon: FaUsers,
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    title: 'Examinations',
    isStaff: true,
    roles: [UserRole.ADMIN, UserRole.TEACHER],
    links: [
      {
        href: DASHBOARD_ROUTES.EXAMS_MANAGE,
        label: 'Manage Exams',
        icon: FaClipboardList,
        roles: [UserRole.ADMIN, UserRole.TEACHER],
      },
      {
        href: DASHBOARD_ROUTES.EXAMS_QUESTION_BANK,
        label: 'Question Bank',
        icon: FaBook,
        roles: [UserRole.ADMIN, UserRole.TEACHER],
      },
      {
        href: DASHBOARD_ROUTES.EXAMS_RESULTS,
        label: 'Results Management',
        icon: FaUserGraduate,
        roles: [UserRole.ADMIN, UserRole.TEACHER],
      },
      {
        href: DASHBOARD_ROUTES.EXAMS_STUDENT_REPORT,
        label: 'Student Reports',
        icon: FaFileInvoiceDollar,
        roles: [UserRole.ADMIN, UserRole.TEACHER],
      },
      {
        href: DASHBOARD_ROUTES.EXAMS_GLOBAL_SETTINGS,
        label: 'Global Exam Settings',
        icon: FaCog,
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    title: 'Finance Management',
    roles: [UserRole.ADMIN, UserRole.FINANCE],
    links: [
      {
        href: DASHBOARD_ROUTES.FINANCE_DASHBOARD,
        label: 'Financial Dashboard',
        icon: FaFileInvoiceDollar,
        roles: [UserRole.ADMIN, UserRole.FINANCE],
      },
      {
        href: DASHBOARD_ROUTES.FINANCE_FEE_MANAGEMENT,
        label: 'Fee Management',
        icon: FaFileInvoiceDollar,
        roles: [UserRole.ADMIN, UserRole.FINANCE],
      },
      {
        href: DASHBOARD_ROUTES.FINANCE_INVOICES,
        label: 'Invoices & Receipts',
        icon: FaFileInvoiceDollar,
        roles: [UserRole.ADMIN, UserRole.FINANCE],
      },
      {
        href: DASHBOARD_ROUTES.FINANCE_PAYMENTS,
        label: 'Payment Processing',
        icon: FaFileInvoiceDollar,
        roles: [UserRole.ADMIN, UserRole.FINANCE],
      },
      {
        href: DASHBOARD_ROUTES.FINANCE_EXPENSES,
        label: 'Expense Management',
        icon: FaFileInvoiceDollar,
        roles: [UserRole.ADMIN, UserRole.FINANCE],
      },
    ],
  },
  {
    title: 'Notification & Mail',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    links: [
      {
        href: DASHBOARD_ROUTES.NOTIFICATION_SEND,
        label: 'Send Bulk Messages',
        icon: FaEnvelope,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      },
      {
        href: DASHBOARD_ROUTES.NOTIFICATION_VIEW,
        label: 'View Notifications',
        icon: FaEnvelope,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      },
    ],
  },
  {
    title: 'General',
    allAuthenticated: true,
    roles: [],
    links: [
      {
        href: DASHBOARD_ROUTES.PROFILE,
        label: 'Profile',
        icon: FaUserCircle,
        allAuthenticated: true,
        roles: [],
      },
      {
        href: DASHBOARD_ROUTES.SETTINGS,
        label: 'Settings',
        icon: FaCog,
        allAuthenticated: true,
        roles: [],
      },
    ],
  },
];
