"use client";

import { useEffect, useState } from 'react';
import { useExamStore } from '@/store/examStore';
import { useAuthStore } from '@/store/authStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { EditExamDialog } from './EditExamDialog';
import { Exam } from '@/types/exam';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteExam } from '@/services/examService';
import { toast } from 'sonner';

export const ExamTable = () => {
  const router = useRouter();
  const { selectedSchool } = useAuthStore();
  const { exams, loading, fetchExams, error } = useExamStore();
  const [isEditExamOpen, setEditExamOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  useEffect(() => {
    if (selectedSchool?.schoolId) {
      fetchExams(selectedSchool.schoolId);
    }
  }, [selectedSchool?.schoolId, fetchExams]);

  const handleViewExam = (examId: string) => {
    router.push(`/examinations/manage/${examId}`);
  };

  const handleEditExam = (exam: Exam) => {
    setSelectedExam(exam);
    setEditExamOpen(true);
  };

  const handleDeleteExam = (exam: Exam) => {
    setExamToDelete(exam);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (examToDelete && selectedSchool) {
      try {
        await deleteExam(examToDelete.id);
        toast.success("Exam deleted successfully!");
        fetchExams(selectedSchool.schoolId);
      } catch (error) {
        toast.error("Failed to delete exam.");
      } finally {
        setDeleteDialogOpen(false);
        setExamToDelete(null);
      }
    }
  };

  if (loading) return <p>Loading exams...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[250px]">Exam Title</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.title}</TableCell>
                <TableCell>{exam.class.name} - {exam.section.name}</TableCell>
                <TableCell>{exam.term.name}</TableCell>
                <TableCell>{new Date(exam.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(exam.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewExam(exam.id)}>
                        View/Manage Papers
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditExam(exam)}>Edit Exam</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteExam(exam)}>
                        Delete Exam
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedExam && (
        <EditExamDialog
          isOpen={isEditExamOpen}
          onClose={() => setEditExamOpen(false)}
          exam={selectedExam}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam
              and all its associated papers and results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
