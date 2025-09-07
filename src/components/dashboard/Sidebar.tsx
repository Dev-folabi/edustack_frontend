"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/utils/permissions';
import { sidebarConfig } from '@/constants/sidebar-links';
import { COLORS } from '@/constants/colors';
import { FaChevronDown, FaChevronLeft } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();
  const { isSuperAdmin, currentRole, isStaff } = usePermissions();
  const { isSidebarCollapsed, toggleSidebar } = useAuthStore();
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (title: string) => {
    setOpenCategories(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const userHasAccess = (roles: any[], isLinkStaff: boolean | undefined, allAuthenticated: boolean | undefined) => {
    if (allAuthenticated) return true;
    if (isSuperAdmin) return true;
    if (isLinkStaff && isStaff) return true;
    if (!currentRole) return false;
    return roles.includes(currentRole);
  };

  return (
    <aside
      className={cn(
        "bg-gray-900 text-white transition-all duration-300 ease-in-out hidden md:flex flex-col",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!isSidebarCollapsed && <h2 className="text-2xl font-bold text-white">EduStack</h2>}
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-800">
          <FaChevronLeft className={cn("transition-transform", isSidebarCollapsed && "rotate-180")} />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {sidebarConfig
          .filter(category => userHasAccess(category.roles, category.isStaff, category.allAuthenticated))
          .map((category) => (
            <div key={category.title}>
              <button
                onClick={() => toggleCategory(category.title)}
                className="w-full flex items-center justify-between p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <div className="flex items-center">
                  <span className={cn(isSidebarCollapsed && "hidden")}>{category.title}</span>
                </div>
                {!isSidebarCollapsed && (
                  <FaChevronDown
                    className={cn(
                      "transition-transform",
                      openCategories.includes(category.title) && "rotate-180"
                    )}
                  />
                )}
              </button>
              {(!isSidebarCollapsed && openCategories.includes(category.title)) && (
                <ul className="pl-4 mt-1 space-y-1">
                  {category.links
                    .filter(link => userHasAccess(link.roles, link.isStaff, link.allAuthenticated))
                    .map((link) => {
                      const isActive = pathname === link.href;
                      const LinkIcon = link.icon;
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={cn(
                              "flex items-center p-2 rounded-md transition-colors",
                              isActive ? "text-white bg-primary-500" : "text-gray-400 hover:bg-gray-800 hover:text-white",
                              isSidebarCollapsed && "justify-center"
                            )}
                            title={link.label}
                          >
                            <LinkIcon className="h-5 w-5 shrink-0" />
                            {!isSidebarCollapsed && <span className="ml-3">{link.label}</span>}
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
