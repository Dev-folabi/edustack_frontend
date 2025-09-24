"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useExamStore } from "@/store/examStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExamPapersTable } from "@/components/dashboard/examinations/ExamPapersTable";
import { AddEditPaperDialog } from "@/components/dashboard/examinations/AddEditPaperDialog";
import { CustomButton } from "@/components/ui/CustomButton";
import { BackButton } from "@/components/ui/BackButton";

const ExamDetailsPage = () => {
  const params = useParams();
  const examId = params.examId as string;
  const { selectedExam, fetchExamById, loading, error } = useExamStore();
  const [isAddPaperOpen, setAddPaperOpen] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchExamById(examId);
    }
  }, [examId, fetchExamById]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg">
          <div className="h-10 bg-gray-300 rounded-t-lg px-6 flex items-center">
            <div className="h-4 w-1/4 bg-gray-400 rounded"></div>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-3 w-20 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-400 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  if (error)
    return (
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );

  if (!selectedExam)
    return (
      <div className="p-4 mb-4 text-sm text-gray-800 rounded-lg bg-gray-50">
        <p className="font-medium">No Data</p>
        <p>No examination record was found.</p>
      </div>
    );

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-6 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-50">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <BackButton/>
            <CardTitle>{selectedExam.title}</CardTitle>
            <CustomButton onClick={() => setAddPaperOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Paper
            </CustomButton>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Class</p>
                <p>
                  {selectedExam.class.name} - {selectedExam.section.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Term</p>
                <p>{selectedExam.term.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p>{new Date(selectedExam.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p>{new Date(selectedExam.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ExamPapersTable papers={selectedExam.papers} examId={examId} />
      </div>
      <AddEditPaperDialog
        isOpen={isAddPaperOpen}
        onClose={() => setAddPaperOpen(false)}
        examId={examId}
      />
    </>
  );
};

export default withAuth(ExamDetailsPage, [UserRole.ADMIN, UserRole.TEACHER]);
