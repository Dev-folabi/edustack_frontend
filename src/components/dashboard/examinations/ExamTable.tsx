"use client";

import { useEffect, useState } from "react";
import { useExamStore } from "@/store/examStore";
import { useAuthStore } from "@/store/authStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { EditExamDialog } from "./EditExamDialog";
import { Exam } from "@/types/exam";
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
import { deleteExam } from "@/services/examService";
import { useToast } from "@/components/ui/Toast";
import { useSessionStore } from "@/store/sessionStore";

export const ExamTable = () => {
  const router = useRouter();
  const { selectedSchool } = useAuthStore();
  const { exams, loading, fetchExams, error } = useExamStore();
  const [isEditExamOpen, setEditExamOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const { selectedSession } = useSessionStore();
  const { showToast } = useToast();

  useEffect(() => {
    if (selectedSchool?.schoolId) {
      fetchExams(selectedSchool.schoolId, selectedSession?.id);
    }
  }, [selectedSchool?.schoolId, selectedSession?.id, fetchExams]);

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
        showToast({
          title: "Success",
          message: "Exam deleted successfully!",
          type: "success",
        });
        fetchExams(selectedSchool.schoolId, selectedSession?.id || "");
      } catch (error) {
        showToast({
          title: "Error",
          message: (error as Error).message || "Failed to delete exam.",
          type: "error",
        });
      } finally {
        setDeleteDialogOpen(false);
        setExamToDelete(null);
      }
    }
  };

  if (loading)
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-8 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  if (error)
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <p className="text-red-600 font-medium text-sm">{error}</p>
      </div>
    );

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
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No exams found.
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>
                    {exam.class.name} - {exam.section.name}
                  </TableCell>
                  <TableCell>{exam.term.name}</TableCell>
                  <TableCell>
                    {new Date(exam.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(exam.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        exam.status
                      )}`}
                    >
                      {exam.status}
                    </span>
                  </TableCell>
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
                        <DropdownMenuItem
                          onClick={() => handleViewExam(exam.id)}
                        >
                          View/Manage Papers
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditExam(exam)}>
                          Edit Exam
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteExam(exam)}
                        >
                          Delete Exam
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
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
              This action cannot be undone. This will permanently delete the
              exam and all its associated papers and results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Draft":
      return "bg-gray-200 text-gray-800";
    case "Scheduled":
      return "bg-blue-200 text-blue-800";
    case "Ongoing":
      return "bg-yellow-200 text-yellow-800";
    case "Completed":
      return "bg-green-200 text-green-800";
    case "Cancelled":
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};
