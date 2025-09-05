"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSessionStore, Session } from '@/store/sessionStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { sessionService } from '@/services/sessionService';
import { useToast } from '@/components/ui/Toast';

const SessionsDashboardPage = () => {
  const { sessions, fetchSessions, isLoading } = useSessionStore();
  const { showToast } = useToast();
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const { activeSession, otherSessions } = useMemo(() => {
    const active = sessions.find(s => s.isActive);
    const others = sessions.filter(s => !s.isActive);
    return { activeSession: active, otherSessions: others };
  }, [sessions]);

  const handleToggleActive = async (session: Session) => {
    try {
      await sessionService.updateSession(session.id, { isActive: !session.isActive });
      showToast({ title: 'Success', message: `Session status updated.`, type: 'success' });
      fetchSessions(); // Refresh the list
    } catch (error) {
      showToast({ title: 'Error', message: 'Failed to update session status.', type: 'error' });
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await sessionService.deleteSession(sessionToDelete.id);
      showToast({ title: 'Success', message: 'Session deleted successfully.', type: 'success' });
      fetchSessions(); // Refresh the list
      setSessionToDelete(null);
    } catch (error) {
      showToast({ title: 'Error', message: 'Failed to delete session.', type: 'error' });
    }
  };

  return (
    <AlertDialog>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sessions & Terms</h1>
          <Link href={`${DASHBOARD_ROUTES.SESSIONS_TERMS}/create`}>
            <Button>
              <FaPlus className="mr-2" /> Create New Session
            </Button>
          </Link>
        </div>

        {isLoading && <p>Loading sessions...</p>}

        {!isLoading && activeSession && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Active Session</h2>
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl">{activeSession.name}</CardTitle>
                <CardDescription>
                  {new Date(activeSession.start_date).toLocaleDateString()} - {new Date(activeSession.end_date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="flex items-center space-x-2">
                    <Switch
                        checked={activeSession.isActive}
                        onCheckedChange={() => handleToggleActive(activeSession)}
                        aria-label="Toggle Active Status"
                    />
                    <label>Active</label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && otherSessions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Archived Sessions</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherSessions.map(session => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.name}</TableCell>
                      <TableCell>{new Date(session.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(session.end_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                           <Switch
                              checked={session.isActive}
                              onCheckedChange={() => handleToggleActive(session)}
                              aria-label="Toggle Active Status"
                          />
                           <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={() => setSessionToDelete(session)}>
                                  Delete
                              </Button>
                          </AlertDialogTrigger>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
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
          <AlertDialogAction onClick={handleDeleteSession}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionsDashboardPage;
