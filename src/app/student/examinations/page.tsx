"use client";

import { useEffect } from 'react';
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";
import { useStudentExamStore } from '@/store/studentExamStore';
import { ExamCard } from '@/components/student-dashboard/ExamCard';

const ExamList = ({ papers, status }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {papers.length > 0 ? (
            papers.map(paper => <ExamCard key={paper.id} paper={paper} status={status} />)
        ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
                <p>No exams in this category.</p>
            </div>
        )}
    </div>
);

const StudentExaminationsPage = () => {
  const { upcoming, ongoing, completed, published, loading, error, fetchStudentExams } = useStudentExamStore();

  useEffect(() => {
    fetchStudentExams();
  }, [fetchStudentExams]);

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
          <TabsTrigger value="results">Published Results</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <ExamList papers={upcoming} status="upcoming" />
        </TabsContent>
        <TabsContent value="ongoing">
          <ExamList papers={ongoing} status="ongoing" />
        </TabsContent>
        <TabsContent value="completed">
            <ExamList papers={completed} status="completed" />
        </TabsContent>
        <TabsContent value="results">
            <ExamList papers={published} status="published" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(StudentExaminationsPage, [UserRole.STUDENT, UserRole.PARENT]);