import {
  FaTachometerAlt, FaUserCircle, FaBook, FaClipboardList, FaFileInvoiceDollar, FaBell
} from 'react-icons/fa';
import { UserRole } from './roles';
import { DASHBOARD_ROUTES } from './routes';
import { IconType } from 'react-icons';
import { SidebarCategory } from './sidebar-links'; // Re-use the interface

export const studentSidebarConfig: SidebarCategory[] = [
  {
    title: 'Dashboard',
    roles: [UserRole.STUDENT, UserRole.PARENT],
    links: [
      {
        href: DASHBOARD_ROUTES.STUDENT_DASHBOARD,
        label: 'Overview',
        icon: FaTachometerAlt,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
      {
        href: DASHBOARD_ROUTES.STUDENT_PROFILE,
        label: 'My Profile',
        icon: FaUserCircle,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
    ],
  },
  {
    title: 'Academics',
    roles: [UserRole.STUDENT, UserRole.PARENT],
    links: [
      {
        href: DASHBOARD_ROUTES.TIMETABLE,
        label: 'Timetable',
        icon: FaClipboardList,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
      {
        href: DASHBOARD_ROUTES.SUBJECTS,
        label: 'Subjects',
        icon: FaBook,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
      {
        href: DASHBOARD_ROUTES.ATTENDANCE_STUDENT,
        label: 'Attendance',
        icon: FaClipboardList,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
    ],
  },
  {
    title: 'Examinations',
    roles: [UserRole.STUDENT, UserRole.PARENT],
    links: [
      {
        href: DASHBOARD_ROUTES.EXAMS_MANAGE,
        label: 'Exam Schedule',
        icon: FaClipboardList,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
      {
        href: DASHBOARD_ROUTES.STUDENT_EXAMS_CBT,
        label: 'CBT Exam',
        icon: FaBook,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
      {
        href: DASHBOARD_ROUTES.EXAMS_RESULTS,
        label: 'Results',
        icon: FaClipboardList,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
    ],
  },
  {
    title: 'Finance',
    roles: [UserRole.STUDENT, UserRole.PARENT],
    links: [
      {
        href: DASHBOARD_ROUTES.FINANCE_INVOICES,
        label: 'Invoices',
        icon: FaFileInvoiceDollar,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
      {
        href: DASHBOARD_ROUTES.FINANCE_PAYMENTS,
        label: 'Payment History',
        icon: FaFileInvoiceDollar,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
      {
        href: DASHBOARD_ROUTES.STUDENT_FINANCE_MAKE_PAYMENT,
        label: 'Make a Payment',
        icon: FaFileInvoiceDollar,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
    ],
  },
  {
    title: 'Notifications',
    roles: [UserRole.STUDENT, UserRole.PARENT],
    links: [
      {
        href: DASHBOARD_ROUTES.STUDENT_NOTIFICATIONS,
        label: 'View All Notifications',
        icon: FaBell,
        roles: [UserRole.STUDENT, UserRole.PARENT],
      },
    ],
  },
];
