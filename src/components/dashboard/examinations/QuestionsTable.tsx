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
import { Question } from '@/types/question';
import { Badge } from '@/components/ui/badge';
import { AddEditQuestionDialog } from './AddEditQuestionDialog';
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
import { deleteQuestion } from '@/services/questionBankService';
import { useQuestionBankStore } from '@/store/questionBankStore';
import { toast } from 'sonner';

interface QuestionsTableProps {
  questions: Question[];
  bankId: string;
}

export const QuestionsTable = ({ questions, bankId }: QuestionsTableProps) => {
  const { fetchQuestionBankById } = useQuestionBankStore();
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setAddEditDialogOpen(true);
  };

  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (questionToDelete) {
      try {
        await deleteQuestion(bankId, questionToDelete.id);
        toast.success("Question deleted successfully!");
        fetchQuestionBankById(bankId);
      } catch (error) {
        toast.error("Failed to delete question.");
      } finally {
        setDeleteDialogOpen(false);
        setQuestionToDelete(null);
      }
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">No questions have been added to this question bank yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium truncate max-w-xs">{question.questionText}</TableCell>
                <TableCell>
                  <Badge>{question.type}</Badge>
                </TableCell>
                <TableCell>{question.marks}</TableCell>
                <TableCell>
                  <Badge variant={
                      question.difficulty === 'EASY' ? 'default' :
                      question.difficulty === 'MEDIUM' ? 'secondary' :
                      'destructive'
                  }>
                    {question.difficulty}
                  </Badge>
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
                      <DropdownMenuItem onClick={() => handleEditQuestion(question)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteQuestion(question)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {isAddEditDialogOpen && (
        <AddEditQuestionDialog
            isOpen={isAddEditDialogOpen}
            onClose={() => {
                setAddEditDialogOpen(false);
                setSelectedQuestion(null);
            }}
            bankId={bankId}
            question={selectedQuestion}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question.
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
