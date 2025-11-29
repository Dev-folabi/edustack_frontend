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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PsychomotorSkill } from '@/types/examSettings';
import { CreateEditPsychomotorSkillDialog } from './CreateEditPsychomotorSkillDialog';
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
import { deletePsychomotorSkill } from '@/services/examSettingsService';
import { useToast } from "@/components/ui/Toast";

export const PsychomotorSkillsTable = () => {
  const { psychomotorSkills, loading, fetchPsychomotorSkills, error } = useExamSettingsStore();
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<PsychomotorSkill | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<PsychomotorSkill | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchPsychomotorSkills();
  }, [fetchPsychomotorSkills]);

  const handleEdit = (skill: PsychomotorSkill) => {
    setSelectedSkill(skill);
    setEditDialogOpen(true);
  };

  const handleDelete = (skill: PsychomotorSkill) => {
    setSkillToDelete(skill);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (skillToDelete) {
      try {
        await deletePsychomotorSkill(skillToDelete.id);
        showToast({
          type: "success",
          title: "Success",
          message: "Psychomotor skill deleted successfully!",
        });
        fetchPsychomotorSkills();
      } catch (error) {
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to delete psychomotor skill.",
        });
      } finally {
        setDeleteDialogOpen(false);
        setSkillToDelete(null);
      }
    }
  };

  if (loading) return <p>Loading psychomotor skills...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Skill Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {psychomotorSkills.map((skill) => (
              <TableRow key={skill.id}>
                <TableCell className="font-medium">{skill.name}</TableCell>
                <TableCell>{skill.description}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleEdit(skill)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(skill)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {isEditDialogOpen && selectedSkill && (
        <CreateEditPsychomotorSkillDialog
          isOpen={isEditDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          skill={selectedSkill}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the psychomotor skill.
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
