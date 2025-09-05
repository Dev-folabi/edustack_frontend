"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EditSessionForm } from '@/components/dashboard/sessions/EditSessionForm';
import { sessionService, Session } from '@/services/sessionService';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { Loader } from '@/components/ui/Loader';

const ManageSessionPage = () => {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionData = async () => {
      try {
        setIsLoading(true);
        const response = await sessionService.getSessionById(sessionId);
        if (response.success && response.data) {
          setSession(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch session data.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Session</h1>
        <Link href={DASHBOARD_ROUTES.SESSIONS_TERMS}>
          <Button variant="outline">Back to Sessions</Button>
        </Link>
      </div>

      {isLoading && <Loader text="Loading session details..." />}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && session && (
        <EditSessionForm initialData={session} />
      )}
    </div>
  );
};

export default ManageSessionPage;
