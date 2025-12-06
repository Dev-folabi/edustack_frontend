"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditSessionForm } from "@/components/dashboard/sessions/EditSessionForm";
import { sessionService } from "@/services/sessionService";
import { Session } from "@/store/sessionStore";
import { DASHBOARD_ROUTES } from "@/constants/routes";
import { Loader } from "@/components/ui/Loader";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";

const ManageSessionPage = () => {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { selectedSchool } = useAuthStore();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !selectedSchool?.schoolId) return;

    const fetchSessionData = async () => {
      try {
        setIsLoading(true);
        const response = await sessionService.getSessionById(
          sessionId,
          selectedSchool.schoolId
        );
        if (response.success && response.data) {
          setSession(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch session data.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId, selectedSchool?.schoolId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Session</h1>
        <Link href={DASHBOARD_ROUTES.SESSIONS}>
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

export default withAuth(ManageSessionPage, [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
]);
