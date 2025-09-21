"use client";

import { useEffect, useState } from 'react';
import { useExamSettingsStore } from '@/store/examSettingsStore';
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
import { GradeCriterion } from '@/types/examSettings';
import { CreateEditGradeDialog } from './CreateEditGradeDialog';
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
import { deleteGradeCriterion } from '@/services/examSettingsService';
import { toast } from 'sonner';

export const GradeCriteriaTable = () => {
  const { gradeCriteria, loading, fetchGradeCriteria, error } = useExamSettingsStore();
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<GradeCriterion | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [criterionToDelete, setCriterionToDelete] = useState<GradeCriterion | null>(null);

  useEffect(() => {
    fetchGradeCriteria();
  }, [fetchGradeCriteria]);

  const handleEdit = (criterion: GradeCriterion) => {
    setSelectedCriterion(criterion);
    setEditDialogOpen(true);
  };

  const handleDelete = (criterion: GradeCriterion) => {
    setCriterionToDelete(criterion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (criterionToDelete) {
      try {
        await deleteGradeCriterion(criterionToDelete.id);
        toast.success("Grade criterion deleted successfully!");
        fetchGradeCriteria();
      } catch (error) {
        toast.error("Failed to delete grade criterion.");
      } finally {
        setDeleteDialogOpen(false);
        setCriterionToDelete(null);
      }
    }
  };

  if (loading) return <p>Loading grade criteria...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Grade</TableHead>
              <TableHead>Score Range</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gradeCriteria.map((criterion) => (
              <TableRow key={criterion.id}>
                <TableCell className="font-medium">{criterion.grade}</TableCell>
                <TableCell>{criterion.minScore} - {criterion.maxScore}</TableCell>
                <TableCell>{criterion.description}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleEdit(criterion)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(criterion)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {isEditDialogOpen && selectedCriterion && (
        <CreateEditGradeDialog
          isOpen={isEditDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          criterion={selectedCriterion}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the grade criterion.
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
