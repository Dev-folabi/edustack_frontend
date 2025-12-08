"use client";

import { useEffect, useState } from "react";
import { useClassStore } from "@/store/classStore";
import { useAuthStore } from "@/store/authStore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Class } from "@/services/classService";
import { ClassItem } from "./ClassItem";
import { CreateEditClassModal } from "./CreateEditClassModal";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

export const ClassList = () => {
  const { classes, isLoading, error, fetchClasses, fetchTeachers, deleteClass } = useClassStore();
  const { selectedSchool }   = useAuthStore();

  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | undefined>(undefined);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSchool?.schoolId) {
      fetchClasses(selectedSchool.schoolId);
      fetchTeachers(selectedSchool.schoolId);
    }
  }, [selectedSchool, fetchClasses, fetchTeachers]);

  const handleOpenCreateModal = () => {
    setSelectedClass(undefined);
    setIsCreateEditModalOpen(true);
  };

  const handleOpenEditModal = (classData: Class) => {
    setSelectedClass(classData);
    setIsCreateEditModalOpen(true);
  };

  const handleOpenDeleteModal = (classId: string) => {
    setClassToDelete(classId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (classToDelete) {
      deleteClass(classToDelete);
    }
    setIsDeleteModalOpen(false);
    setClassToDelete(null);
  };

  if (isLoading && classes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage Classes</h2>
        <Button onClick={handleOpenCreateModal}>Add New Class</Button>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {classes.map((classData) => (
          <AccordionItem key={classData.id} value={classData.id}>
            <AccordionTrigger>{classData.name}</AccordionTrigger>
            <AccordionContent>
              <ClassItem
                classData={classData}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <CreateEditClassModal
        isOpen={isCreateEditModalOpen}
        onClose={() => setIsCreateEditModalOpen(false)}
        classData={selectedClass}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this class?"
        description="This action cannot be undone. This will permanently delete the class and all its sections."
      />
    </div>
  );
};
