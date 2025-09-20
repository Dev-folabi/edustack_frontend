"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/utils/permissions';
import { sidebarConfig } from '@/constants/sidebar-links';
import { COLORS } from '@/constants/colors';
import { FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IconType } from 'react-icons';

const Sidebar = () => {
  const pathname = usePathname();
  const { isSuperAdmin, currentRole, isStaff } = usePermissions();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCategory = (title: string) => {
    if (isCollapsed) return; // Don't toggle when collapsed
    setOpenCategories(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setOpenCategories([]); // Close all categories when collapsing
    }
  };

  const userHasAccess = (roles: any[], isLinkStaff: boolean | undefined, allAuthenticated: boolean | undefined) => {
    if (allAuthenticated) return true;
    if (isSuperAdmin) return true;
    if (isLinkStaff && isStaff) return true;
    if (!currentRole) return false;
    if (roles.length === 0) return true;
    return roles.includes(currentRole);
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white transition-all duration-300 ease-in-out hidden md:block relative`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 bg-gray-900 text-white rounded-full p-1 border-2 border-gray-700 hover:bg-gray-800 transition-colors z-10"
      >
        {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
      </button>

      <div className="p-6">
        <div className="mb-8">
          <h2 className={`text-2xl font-bold text-white transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            {!isCollapsed && 'EduStack'}
          </h2>
          {isCollapsed && (
            <div className="text-xl font-bold text-center">E</div>
          )}
        </div>
        
        <nav className="overflow-y-auto max-h-[calc(100vh-120px)]">
          <ul>
            {sidebarConfig
              .filter(category => userHasAccess(category.roles, category.isStaff, category.allAuthenticated))
              .map((category) => (
              <li key={category.title} className="mb-2">
                {!isCollapsed ? (
                  <>
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
                  </>
                ) : (
                  // Collapsed view - show only icons
                  <div className="space-y-1">
                    {category.links
                      .filter(link => userHasAccess(link.roles, link.isStaff, link.allAuthenticated))
                      .map((link) => {
                      const isActive = pathname === link.href;
                      const LinkIcon = link.icon as IconType;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                            isActive
                              ? 'text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                          style={{
                            backgroundColor: isActive ? COLORS.primary[500] : 'transparent'
                          }}
                          title={link.label}
                        >
                          <LinkIcon size={20} />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
