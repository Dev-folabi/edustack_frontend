"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/utils/permissions';
import { sidebarConfig } from '@/constants/sidebar-links';
import { COLORS } from '@/constants/colors';
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaBars, FaTimes } from 'react-icons/fa';
import { IconType } from 'react-icons';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen, 
  setIsMobileOpen 
}) => {
  const pathname = usePathname();
  const { isSuperAdmin, currentRole, isStaff } = usePermissions();
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (title: string) => {
    if (isCollapsed) {
      // If collapsed, expand sidebar first
      setIsCollapsed(false);
    }
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

  const handleLinkClick = () => {
    // Close mobile sidebar when link is clicked
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={`mb-8 flex items-center justify-between ${
        isCollapsed ? 'px-2' : 'px-0'
      }`}>
        {!isCollapsed && (
          <h2 className="text-2xl font-bold text-white truncate">EduStack</h2>
        )}
        {isCollapsed && (
          <h2 className="text-xl font-bold text-white text-center w-full">ES</h2>
        )}
        
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />}
        </button>
        
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <ul className="space-y-1">
          {sidebarConfig
            .filter(category => userHasAccess(category.roles, category.isStaff, category.allAuthenticated))
            .map((category) => (
            <li key={category.title}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.title)}
                className={`w-full flex items-center justify-between p-3 rounded-md transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white group ${
                  isCollapsed ? 'px-3' : 'px-3'
                }`}
                title={isCollapsed ? category.title : ''}
              >
                <span className={`${isCollapsed ? 'sr-only' : 'block'} truncate`}>
                  {category.title}
                </span>
                {isCollapsed && (
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded text-xs font-semibold">
                    {category.title.charAt(0)}
                  </div>
                )}
                {!isCollapsed && (
                  <FaChevronDown 
                    className={`transition-transform duration-200 ${
                      openCategories.includes(category.title) ? 'rotate-180' : ''
                    }`} 
                    size={12}
                  />
                )}
              </button>
              
              {/* Category Links */}
              {(openCategories.includes(category.title) || isCollapsed) && (
                <ul className={`${isCollapsed ? 'space-y-1' : 'ml-4 mt-2 space-y-1'}`}>
                  {category.links
                    .filter(link => userHasAccess(link.roles, link.isStaff, link.allAuthenticated))
                    .map((link) => {
                    const isActive = pathname === link.href;
                    const LinkIcon = link.icon as IconType;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={handleLinkClick}
                          className={`flex items-center p-3 rounded-md transition-all duration-200 group ${
                            isActive
                              ? 'text-white shadow-lg'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                          style={{
                            backgroundColor: isActive ? COLORS.primary[500] : 'transparent'
                          }}
                          title={isCollapsed ? link.label : ''}
                        >
                          <LinkIcon 
                            className={`${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} 
                            size={18}
                          />
                          {!isCollapsed && (
                            <span className="truncate">{link.label}</span>
                          )}
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
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      } min-h-screen`}>
        <div className="p-4 flex flex-col h-full">
          {sidebarContent}
        </div>
      </aside>
      
      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 w-64 h-full bg-gray-900 text-white transform transition-transform duration-300 ease-in-out md:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 flex flex-col h-full">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
