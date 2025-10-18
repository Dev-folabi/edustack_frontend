"use client";

import { useState } from "react";
import { Question } from "@/types/question";
import { AddEditQuestionDialog } from "./AddEditQuestionDialog";
import { deleteQuestion } from "@/services/questionBankService";
import { useQuestionBankStore } from "@/store/questionBankStore";
import { useToast } from "@/components/ui/Toast";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface QuestionsTableProps {
  questions: Question[];
  bankId: string;
}

export const QuestionsTable = ({ questions, bankId }: QuestionsTableProps) => {
  const { fetchQuestionBankById } = useQuestionBankStore();
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null
  );

  const { showToast } = useToast()

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
        showToast({
          title: "Success",
          message: "Question deleted successfully!",
          type: "success",
        });
        fetchQuestionBankById(bankId);
      } catch (error) {
        showToast({
          title: "Error",
          message: (error as Error).message || "Failed to delete question.",
          type: "error",
        });
      } finally {
        setDeleteDialogOpen(false);
        setQuestionToDelete(null);
      }
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-gray-500">
          No questions have been added to this question bank yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white p-3">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-6 py-3 font-medium w-[45%]">Question</th>
              <th className="px-6 py-3 font-medium w-[15%]">Type</th>
              <th className="px-6 py-3 font-medium w-[10%]">Marks</th>
              <th className="px-6 py-3 font-medium w-[15%]">Difficulty</th>
              <th className="px-6 py-3 font-medium w-[15%] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {questions.map((question) => (
              <tr
                key={question.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-800 truncate max-w-md">
                  {question.questionText}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {question.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{question.marks}</td>
                <td className="px-6 py-4">
                  {question.difficulty === "Easy" && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Easy
                    </span>
                  )}
                  {question.difficulty === "Medium" && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Medium
                    </span>
                  )}
                  {question.difficulty === "Hard" && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Hard
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-lg shadow-md border border-gray-200 bg-white"
                    >
                      <DropdownMenuItem
                        onClick={() => handleEditQuestion(question)}
                        className="cursor-pointer text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteQuestion(question)}
                        className="cursor-pointer text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      {isAddEditDialogOpen && (
        <AddEditQuestionDialog
          isOpen={isAddEditDialogOpen}
          onClose={() => {
            setAddEditDialogOpen(false);
            setSelectedQuestion(null);
          }}
          bankId={bankId}
          question={selectedQuestion || undefined}
        />
      )}

      {/* Delete Confirm Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl shadow-lg border border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-800">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently delete the
              question.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
