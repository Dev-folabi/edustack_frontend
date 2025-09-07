"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSessionStore, Session, Term } from '@/store/sessionStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FaPlus, FaTrash, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { sessionService } from '@/services/sessionService';
import { useToast } from '@/components/ui/Toast';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { Skeleton } from '@/components/ui/skeleton';

const SessionsDashboardPage = () => {
  const { sessions, fetchSessions, isLoading } = useSessionStore();
  const { showToast } = useToast();
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [sessionTerms, setSessionTerms] = useState<Record<string, Term[]>>({});
  const [termsLoading, setTermsLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const { activeSession, otherSessions } = useMemo(() => {
    const active = sessions.find(s => s.isActive);
    const others = sessions.filter(s => !s.isActive).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
    return { activeSession: active, otherSessions: others };
  }, [sessions]);

  const handleToggleActive = async (sessionToToggle: Session) => {
    const currentlyActive = sessions.find(s => s.isActive && s.id !== sessionToToggle.id);

    try {
      if (currentlyActive) {
        await sessionService.updateSession(currentlyActive.id, { isActive: false });
      }
      await sessionService.updateSession(sessionToToggle.id, { isActive: !sessionToToggle.isActive });

      showToast({ title: 'Success', message: 'Active session updated successfully.', type: 'success' });
      fetchSessions();
    } catch (error) {
      showToast({ title: 'Error', message: 'Failed to update session status.', type: 'error' });
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await sessionService.deleteSession(sessionToDelete.id);
      showToast({ title: 'Success', message: 'Session deleted successfully.', type: 'success' });
      fetchSessions();
      setSessionToDelete(null);
    } catch (error) {
      showToast({ title: 'Error', message: 'Failed to delete session.', type: 'error' });
    }
  };

  const handleToggleExpand = async (sessionId: string) => {
    const isExpanded = expandedSessions[sessionId];
    if (!isExpanded && !sessionTerms[sessionId]) {
      setTermsLoading(prev => ({...prev, [sessionId]: true}));
      try {
        const response = await sessionService.getTermsForSession(sessionId);
        setSessionTerms(prev => ({ ...prev, [sessionId]: response.data.data }));
      } catch (error) {
        showToast({ title: 'Error', message: 'Failed to fetch terms for the session.', type: 'error' });
      } finally {
        setTermsLoading(prev => ({...prev, [sessionId]: false}));
      }
    }
    setExpandedSessions(prev => ({ ...prev, [sessionId]: !isExpanded }));
  };

  const SessionCard = ({ session }: { session: Session }) => {
    const isExpanded = expandedSessions[session.id];
    const terms = sessionTerms[session.id] || [];
    const isLoadingTerms = termsLoading[session.id];

    return (
      <Card className={`mb-4 ${session.isActive ? 'bg-[var(--primary-50)] border-[var(--primary-200)]' : ''}`}>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{session.name}</CardTitle>
            <CardDescription>
              {new Date(session.start_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                  id={`active-switch-${session.id}`}
                  checked={session.isActive}
                  onCheckedChange={() => handleToggleActive(session)}
                  aria-label="Toggle Active Status"
              />
              <label htmlFor={`active-switch-${session.id}`} className="text-sm font-medium">Active</label>
            </div>
            <Link href={`${DASHBOARD_ROUTES.SESSIONS}/${session.id}/manage`}>
              <Button variant="outline" size="sm"><FaEdit className="mr-2" /> Edit</Button>
            </Link>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" onClick={() => setSessionToDelete(session)}>
                <FaTrash className="mr-2" /> Delete
              </Button>
            </AlertDialogTrigger>
            <Button variant="ghost" size="sm" onClick={() => handleToggleExpand(session.id)}>
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </Button>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            <h4 className="font-semibold mb-2">Terms</h4>
            {isLoadingTerms ? <p>Loading terms...</p> : (
              <ul className="list-disc pl-5 space-y-1">
                {terms.length > 0 ? terms.map(term => (
                  <li key={term.id}>{term.name} ({new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()})</li>
                )) : <li>No terms found for this session.</li>}
              </ul>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-32 w-full" />
        </div>
    )
  }

  return (
    <AlertDialog>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sessions & Terms</h1>
          <Link href={`${DASHBOARD_ROUTES.SESSIONS}/create`}>
            <Button>
              <FaPlus className="mr-2" /> Create New Session
            </Button>
          </Link>
        </div>

        {activeSession ? (
          <SessionCard session={activeSession} />
        ) : <p>No active session found. Please set one.</p>}

        {otherSessions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Archived Sessions</h2>
            {otherSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}

      </div>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will delete the session and all its associated terms. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteSession} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default withAuth(SessionsDashboardPage, [UserRole.SUPER_ADMIN, UserRole.ADMIN]);
