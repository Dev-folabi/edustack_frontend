"use client";

import React, { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';

const SessionSelector = () => {
  const { sessions, selectedSession, fetchSessions, setSelectedSession, isLoading } = useSessionStore();
  const { selectedSchool } = useAuthStore();
  useEffect(() => {
    fetchSessions(selectedSchool?.schoolId ?? "");
  }, [fetchSessions, selectedSchool?.schoolId]);

  if (isLoading) {
    return <Skeleton className="h-10 w-[180px]" />;
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

export default SessionSelector;
