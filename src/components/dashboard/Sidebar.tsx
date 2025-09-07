"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/utils/permissions';
import { sidebarConfig } from '@/constants/sidebar-links';
import { COLORS } from '@/constants/colors';
import { FaChevronDown } from 'react-icons/fa';
import { IconType } from 'react-icons';

const Sidebar = () => {
  const pathname = usePathname();
  const { isSuperAdmin, currentRole, isStaff } = usePermissions();
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (title: string) => {
    setOpenCategories(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const userHasAccess = (roles: any[], isLinkStaff: boolean | undefined, allAuthenticated: boolean | undefined) => {
    if (allAuthenticated) return true; // Accessible to all authenticated users
    if (isSuperAdmin) return true;
    if (isLinkStaff && isStaff) return true;
    if (!currentRole) return false;
    return roles.includes(currentRole);
  };

  return (
    <aside className="w-64 bg-gray-900 text-white p-6 hidden md:block">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">EduStack</h2>
      </div>
      <nav>
        <ul>
          {sidebarConfig
            .filter(category => userHasAccess(category.roles, category.isStaff, category.allAuthenticated))
            .map((category) => (
            <li key={category.title} className="mb-2">
              <button
                onClick={() => toggleCategory(category.title)}
                className="w-full flex justify-between items-center p-2 rounded-md transition-colors text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <span>{category.title}</span>
                <FaChevronDown className={`transition-transform ${openCategories.includes(category.title) ? 'rotate-180' : ''}`} />
              </button>
              {openCategories.includes(category.title) && (
                <ul className="pl-4 mt-2">
                  {category.links
                    .filter(link => userHasAccess(link.roles, link.isStaff, link.allAuthenticated))
                    .map((link) => {
                    const isActive = pathname === link.href;
                    const LinkIcon = link.icon as IconType;
                    return (
                      <li key={link.href} className="mb-2">
                        <Link
                          href={link.href}
                          className={`flex items-center p-2 rounded-md transition-colors ${
                            isActive
                              ? 'text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                          style={{
                            backgroundColor: isActive ? COLORS.primary[500] : 'transparent'
                          }}
                        >
                          <LinkIcon className="mr-3" />
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
