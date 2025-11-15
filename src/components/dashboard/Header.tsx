"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SchoolSelector from "./SchoolSelector";
import SessionSelector from "./SessionSelector";
import { Bell, Settings, User, LogOut, ChevronDown, Menu } from "lucide-react";
import { SCHOOL_INFO } from "@/constants/config";

const NotificationDropdown = () => {
  const [notifications] = useState([
    {
      id: 1,
      title: "New student enrolled",
      message: "John Doe has been enrolled in Grade 10",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Fee payment received",
      message: "Payment of ₦50,000 received from Mary Jane",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Report card generated",
      message: "First term report cards are ready",
      time: "2 hours ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start p-3 cursor-pointer"
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-blue-600 font-medium">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserProfile = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const userInitial = user.username
    ? user.username.charAt(0).toUpperCase()
    : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1 h-auto hover:bg-gray-100 rounded-lg"
        >
          <Avatar className="h-9 w-9 border-2 border-blue-500">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-900 leading-none">
              {user.username}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-2">
            <Avatar className="h-12 w-12 border-2 border-blue-500">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold text-gray-900">
                {user.username}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/profile")}
          className="cursor-pointer py-2"
        >
          <User className="mr-3 h-4 w-4 text-gray-500" />
          <span>My Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="cursor-pointer py-2"
        >
          <Settings className="mr-3 h-4 w-4 text-gray-500" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-medium">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type HeaderProps = {
  onToggleMenu?: () => void;
  isMobileMenuOpen?: boolean;
};

const Header: React.FC<HeaderProps> = ({ onToggleMenu, isMobileMenuOpen }) => {
  return (
    <header
      className={`sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-6 py-3 ${
        isMobileMenuOpen ? "hidden md:block" : "block"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left Section - Mobile menu + selectors */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile menu button (visible only on small screens) */}
          {onToggleMenu && (
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMenu}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="ml-2">
                <h1 className="text-lg font-bold text-gray-900">
                  {SCHOOL_INFO.name}
                </h1>
              </div>
            </div>
          )}

          {/* School Selector */}
          <div className="hidden sm:block">
            <SchoolSelector />
          </div>

          {/* Session Selector */}
          <div className="hidden sm:block">
            <SessionSelector />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Profile */}
          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default Header;
