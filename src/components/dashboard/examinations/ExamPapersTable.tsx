"use client";

import { useState } from 'react';
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
import { ExamPaper } from '@/types/exam';
import { Badge } from '@/components/ui/badge';
import { AddEditPaperDialog } from './AddEditPaperDialog';
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
import { deleteExamPaper } from '@/services/examService';
import { useExamStore } from '@/store/examStore';
import { useToast } from "@/components/ui/Toast";

interface ExamPapersTableProps {
  papers: ExamPaper[];
  examId: string;
}

export const ExamPapersTable = ({ papers, examId }: ExamPapersTableProps) => {
  const { fetchExamById } = useExamStore();
  const [isAddEditPaperOpen, setAddEditPaperOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<ExamPaper | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<ExamPaper | null>(null);

  const handleEditPaper = (paper: ExamPaper) => {
    setSelectedPaper(paper);
    setAddEditPaperOpen(true);
  };

  const handleDeletePaper = (paper: ExamPaper) => {
    setPaperToDelete(paper);
    setDeleteDialogOpen(true);
  };

  const { showToast } = useToast();

  const confirmDelete = async () => {
    if (paperToDelete) {
      try {
        await deleteExamPaper(examId, paperToDelete.id);
        showToast({
          type: "success",
          title: "Success",
          message: "Exam paper deleted successfully!",
        });
        fetchExamById(examId);
      } catch (error) {
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to delete exam paper.",
        });
      } finally {
        setDeleteDialogOpen(false);
        setPaperToDelete(null);
      }
    }
  };

  if (!papers || papers.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">No exam papers have been added to this exam yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Max Marks</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {papers.map((paper) => (
              <TableRow key={paper.id}>
                <TableCell className="font-medium">{paper.subject.name}</TableCell>
                <TableCell>
                  <Badge variant={paper.mode === 'CBT' ? 'default' : 'secondary'}>
                    {paper.mode}
                  </Badge>
                </TableCell>
                <TableCell>{paper.maxMarks}</TableCell>
                <TableCell>{new Date(paper.startTime).toLocaleString()}</TableCell>
                <TableCell>{new Date(paper.endTime).toLocaleString()}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleEditPaper(paper)}>Edit Paper</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePaper(paper)}>Delete Paper</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {isAddEditPaperOpen && (
        <AddEditPaperDialog
            isOpen={isAddEditPaperOpen}
            onClose={() => {
                setAddEditPaperOpen(false);
                setSelectedPaper(null);
            }}
            examId={examId}
            paper={selectedPaper ?? undefined}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam paper.
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
