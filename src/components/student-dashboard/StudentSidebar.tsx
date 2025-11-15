"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/utils/permissions";
import { studentSidebarConfig } from "@/constants/student-sidebar-links";
import { UserRole } from "@/constants/roles";
import { SCHOOL_INFO } from "@/constants/config";
import { ChevronDown, ChevronRight } from "lucide-react";
import { IconType } from "react-icons";
import { SidebarCategory } from "@/constants/sidebar-links";
import { cn } from "@/lib/utils";

const StudentSidebar: React.FC = () => {
  const pathname = usePathname();
  const { isSuperAdmin, currentRole, isStaff } = usePermissions();
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (title: string) => {
    setOpenCategories((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const userHasAccess = (
    roles: UserRole[] = [],
    isLinkStaff?: boolean,
    allAuthenticated?: boolean
  ) => {
    if (allAuthenticated) return true;
    if (isSuperAdmin) return true;
    if (isLinkStaff && isStaff) return true;
    if (!currentRole) return false;
    if (roles.length === 0) return true;
    return roles.includes(currentRole as UserRole);
  };

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 shadow-sm">
      {/* Logo / Header */}
      <div className="flex items-center justify-center py-6 border-b border-gray-200 px-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
            <Image
              src={SCHOOL_INFO.logo}
              alt={SCHOOL_INFO.name}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {SCHOOL_INFO.name}
            </h1>
            <p className="text-xs text-gray-500">Student Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <ul className="space-y-1">
          {(studentSidebarConfig as SidebarCategory[])
            .filter((category) =>
              userHasAccess(
                category.roles,
                category.isStaff,
                category.allAuthenticated
              )
            )
            .map((category) => {
              const isCategoryOpen = openCategories.includes(category.title);
              const hasActiveLink = category.links.some(
                (link) => pathname === link.href
              );

              return (
                <li key={category.title}>
                  <>
                    <button
                      onClick={() => toggleCategory(category.title)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
                        isCategoryOpen || hasActiveLink
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <span className="text-sm font-semibold tracking-wide uppercase">
                        {category.title}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          isCategoryOpen ? "rotate-180" : ""
                        )}
                      />
                    </button>

                    {isCategoryOpen && (
                      <ul className="mt-1 space-y-0.5 pl-2">
                        {category.links
                          .filter((link) =>
                            userHasAccess(
                              link.roles,
                              link.isStaff,
                              link.allAuthenticated
                            )
                          )
                          .map((link) => {
                            const isActive = pathname === link.href;
                            const LinkIcon = link.icon as IconType;

                            return (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                      : "text-gray-700 hover:bg-gray-100"
                                  )}
                                >
                                  {/* Active Indicator */}
                                  {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                                  )}

                                  <div
                                    className={cn(
                                      "flex items-center justify-center w-5 h-5",
                                      isActive
                                        ? "text-white"
                                        : "text-gray-500 group-hover:text-blue-600"
                                    )}
                                  >
                                    <LinkIcon size={18} />
                                  </div>

                                  <span
                                    className={cn(
                                      "text-sm font-medium flex-1",
                                      isActive
                                        ? "text-white"
                                        : "text-gray-700 group-hover:text-gray-900"
                                    )}
                                  >
                                    {link.label}
                                  </span>

                                  {!isActive && (
                                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                      </ul>
                    )}
                  </>
                </li>
              );
            })}
        </ul>
      </nav>
    </aside>
  );
};

export default StudentSidebar;
