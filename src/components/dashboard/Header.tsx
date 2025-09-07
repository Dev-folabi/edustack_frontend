"use client";

import React, { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useAuthStore } from '@/store/authStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const SessionSelector = () => {
  const { sessions, selectedSession, fetchSessions, setSelectedSession, isLoading } = useSessionStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  if (isLoading) {
    return <div>Loading Sessions...</div>;
  }

  if (!selectedSession) {
      return null;
  }

  return (
    <Select
      value={selectedSession.id}
      onValueChange={(sessionId) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          setSelectedSession(session);
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a session" />
      </SelectTrigger>
      <SelectContent>
        {sessions.map((session) => (
          <SelectItem key={session.id} value={session.id}>
            {session.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const UserProfile = () => {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
    };

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <FaUserCircle className="h-8 w-8" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

import SchoolSelector from './SchoolSelector';

const Header = () => {
  const { loadSchools } = useAuthStore();

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  return (
    <header className="bg-white shadow-sm p-4 border-b flex justify-between items-center">
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
