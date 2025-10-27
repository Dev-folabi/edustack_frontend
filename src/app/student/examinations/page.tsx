"use client";

import { useEffect, useMemo } from "react";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";
import { useStudentExamStore } from "@/store/studentExamStore";
import { ExamCard } from "@/components/student-dashboard/ExamCard";
import { useAuthStore } from "@/store/authStore";
import { useSessionStore } from "@/store/sessionStore";

const ExamList = ({ exams, status }: { exams: any[]; status: string }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    {exams.length > 0 ? (
      exams.map(({ exam, paper }) => (
        <ExamCard
          key={paper?.id ?? exam.id}
          exam={exam}
          paper={paper}
          status={status}
        />
      ))
    ) : (
      <div className="col-span-full text-center py-12 text-gray-500">
        <p>No exams in this category.</p>
      </div>
    )}
  </div>
);

const StudentExaminationsPage = () => {
  const { loading, error, exams, fetchStudentExams } = useStudentExamStore();
  const { student } = useAuthStore();
  const { selectedSession } = useSessionStore();

  useEffect(() => {
    if (student && selectedSession) {
      fetchStudentExams(student.id, selectedSession.id);
    }
  }, [fetchStudentExams, student, selectedSession]);

  // --- Group papers by status and attempts ---
  const { upcoming, ongoing, completed, cancelled } = useMemo(() => {
    const groups = {
      upcoming: [] as any[],
      ongoing: [] as any[],
      completed: [] as any[],
      cancelled: [] as any[],
    };

    exams?.forEach((exam) => {
      if (exam.status.toLowerCase() === "draft") return;

      if (exam.papers?.length > 0) {
        exam.papers.forEach((paper: any) => {
          const hasSubmitted = paper.attempts?.some(
            (attempt: any) => attempt.status === "Submitted"
          );

          if (hasSubmitted) {
            groups.completed.push({ exam, paper });
            return;
          }

          switch (exam.status.toLowerCase()) {
            case "scheduled":
              groups.upcoming.push({ exam, paper });
              break;
            case "ongoing":
              groups.ongoing.push({ exam, paper });
              break;
            case "completed":
              groups.completed.push({ exam, paper });
              break;
            case "cancelled":
              groups.cancelled.push({ exam, paper });
              break;
            default:
              break;
          }
        });
      } else {
        // exams with no papers
        switch (exam.status.toLowerCase()) {
          case "scheduled":
            groups.upcoming.push({ exam });
            break;
          case "ongoing":
            groups.ongoing.push({ exam });
            break;
          case "completed":
            groups.completed.push({ exam });
            break;
          case "cancelled":
            groups.cancelled.push({ exam });
            break;
        }
      }
    });

    return groups;
  }, [exams]);

  if (loading) return <p>Loading exams...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">My Examinations</h1>
      </div>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <ExamList exams={upcoming} status="Scheduled" />
        </TabsContent>
        <TabsContent value="ongoing">
          <ExamList exams={ongoing} status="Ongoing" />
        </TabsContent>
        <TabsContent value="completed">
          <ExamList exams={completed} status="Completed" />
        </TabsContent>
        <TabsContent value="cancelled">
          <ExamList exams={cancelled} status="Cancelled" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(StudentExaminationsPage, [
  UserRole.STUDENT,
  UserRole.PARENT,
]);
