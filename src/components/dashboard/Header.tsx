"use client";

import React from "react";
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
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { COLORS } from "@/constants/config";
import SchoolSelector from "./SchoolSelector";
import SessionSelector from "./SessionSelector";

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
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar
            className="h-10 w-10 border-2"
            style={{ borderColor: COLORS.primary[500] }}
          >
            <AvatarImage src={""} alt={user.username} />
            <AvatarFallback
              style={{
                backgroundColor: COLORS.primary[100],
                color: COLORS.primary[600],
              }}
            >
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Header = () => {
  return (
    <header className="bg-background-primary shadow-sm p-4 border-b flex justify-between items-center">
      <div>{/* Logo can go here */}</div>
      <div className="flex items-center space-x-4">
        <SchoolSelector />
        <SessionSelector />
        <UserProfile />
      </div>
    </header>
  );
};

export default Header;
