"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { reportService } from "@/services/reportService";
import { PageHeader } from "@/components/ui/page-header";
import { Loading } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { sessionService } from "@/services/sessionService";

export const StudentReportCard = () => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const { selectedSchool } = useAuthStore();
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>();
  const [selectedSession, setSelectedSession] = useState<string | undefined>();

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getSessions(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["student-report-card", studentId, selectedTerm, selectedSession],
    queryFn: () =>
      reportService.getStudentTermReport({
        studentId: studentId!,
        termId: selectedTerm!,
        sessionId: selectedSession!,
      }),
    enabled: !!selectedTerm && !!selectedSession,
  });

  return (
    <div>
      <PageHeader title="My Report Card" />
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={setSelectedSession}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Session" />
          </SelectTrigger>
          <SelectContent>
            {sessions?.data.map((session: any) => (
              <SelectItem key={session.id} value={session.id}>
                {session.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setSelectedTerm}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Term" />
          </SelectTrigger>
          <SelectContent>
            {sessions?.data
              .find((session: any) => session.id === selectedSession)
              ?.terms.map((term: any) => (
                <SelectItem key={term.id} value={term.id}>
                  {term.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <Loading /> : <div>{data && <ReportCard report={data.data} />}</div>}
    </div>
  );
};
