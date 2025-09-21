"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { useExamStore } from '@/store/examStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExamPapersTable } from '@/components/dashboard/examinations/ExamPapersTable';
import { AddEditPaperDialog } from '@/components/dashboard/examinations/AddEditPaperDialog';

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

  if (loading) return <p>Loading exam details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!selectedExam) return <p>No exam found.</p>;

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{selectedExam.title}</CardTitle>
            <Button onClick={() => setAddPaperOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Paper
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Class</p>
                <p>{selectedExam.class.name} - {selectedExam.section.name}</p>
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
