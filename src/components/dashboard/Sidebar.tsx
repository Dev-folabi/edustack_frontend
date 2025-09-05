"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { DASHBOARD_ROUTES } from '@/constants/routes';

const superAdminLinks = [
  { href: DASHBOARD_ROUTES.MULTI_SCHOOL_DASHBOARD, label: 'Dashboard' },
  { href: DASHBOARD_ROUTES.SCHOOL_MANAGEMENT, label: 'Schools' },
  { href: DASHBOARD_ROUTES.ACADEMIC_SETTINGS, label: 'Academic Settings' },
  // Add more links as they are built
];

const schoolAdminLinks = [
    { href: DASHBOARD_ROUTES.SCHOOL_DASHBOARD, label: 'Dashboard' },
    { href: DASHBOARD_ROUTES.CLASS_MANAGEMENT, label: 'Class Management' },
    // Add more links
];


const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Determine which links to show based on user role
  // This is a simplified check. A real app would have a more robust role system.
  const links = user?.isSuperAdmin ? superAdminLinks : schoolAdminLinks;

  return (
    <aside className="w-64 bg-gray-900 text-white p-6 hidden md:block">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">EduStack</h2>
      </div>
      <nav>
        <ul>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href} className="mb-2">
                <Link
                  href={link.href}
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-sky-500 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
