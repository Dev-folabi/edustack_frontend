"use client";

import { useEffect, useState } from "react";
import { useQuestionBankStore } from "@/store/questionBankStore";
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
import { QuestionBank } from "@/types/questionBank";
import { CreateEditQuestionBankDialog } from "./CreateEditQuestionBankDialog";
import { useSubjectStore } from "@/store/subjectStore";
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
import { deleteQuestionBank } from "@/services/questionBankService";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/skeleton";

export const QuestionBankTable = () => {
  const router = useRouter();
  const { selectedSchool } = useAuthStore();
  const { questionBanks, loading, fetchAllQuestionBanks, error } =
    useQuestionBankStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<QuestionBank | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (selectedSchool?.schoolId) {
      fetchAllQuestionBanks(selectedSchool.schoolId);
      fetchSubjects(selectedSchool.schoolId);
    }
  }, [selectedSchool?.schoolId, fetchAllQuestionBanks, fetchSubjects]);

  const handleViewQuestionBank = (bankId: string) => {
    router.push(`/examinations/question-bank/${bankId}`);
  };

  const handleEditBank = (bank: QuestionBank) => {
    setSelectedBank(bank);
    setEditDialogOpen(true);
  };

  const handleDeleteBank = (bank: QuestionBank) => {
    setBankToDelete(bank);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (bankToDelete && selectedSchool) {
      try {
        await deleteQuestionBank(bankToDelete.id);
        showToast({
          type: "success",
          title: "Success",
          message: "Question bank deleted successfully!",
        });
        fetchAllQuestionBanks(selectedSchool.schoolId);
      } catch (error) {
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to delete question bank.",
        });
      } finally {
        setDeleteDialogOpen(false);
        setBankToDelete(null);
      }
    }
  };

  if (loading)
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );

  if (error) return <p>Error: {error || "Failed to load question banks."}</p>;
console.log({questionBanks, loading});
 return (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <Table>
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>No. of Questions</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!loading && questionBanks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-gray-500">
              No question banks found.
            </TableCell>
          </TableRow>
        ) : (
          questionBanks.map((bank) => (
            <TableRow key={bank.id}>
              <TableCell className="font-medium">{bank.name}</TableCell>
              <TableCell>
                {subjects.find((s) => s.id === bank.subjectId)?.name || "N/A"}
              </TableCell>
              <TableCell>{bank._count?.questions || 0}</TableCell>
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
                      onClick={() => handleViewQuestionBank(bank.id)}
                    >
                      View/Manage Questions
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditBank(bank)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteBank(bank)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>

    {selectedBank && (
      <CreateEditQuestionBankDialog
        isOpen={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        bank={selectedBank}
      />
    )}

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            question bank.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
);
};
