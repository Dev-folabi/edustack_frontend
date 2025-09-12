"use client";

import React, { useEffect, useState } from "react";
import { useSchoolStore } from "@/store/schoolStore";
import { useClassStore } from "@/store/classStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Class,
  CreateClassData,
  UpdateClassData,
} from "@/services/classService";
import { Loader, PlusCircle, Trash2 } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multi-select";

const createFormSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  schoolId: z.array(z.string()).min(1, "At least one school must be selected"),
  sections: z.array(
    z.object({ name: z.string().min(1, "Section name is required") })
  ),
});

const editFormSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  sections: z.array(
    z.object({ name: z.string().min(1, "Section name is required") })
  ),
});

const EditClassModal = ({
  isOpen,
  onClose,
  classData,
  onClassUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  classData: Class | null;
  onClassUpdated: () => void;
}) => {
  const { updateClass } = useClassStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    if (classData) {
      reset({
        name: classData.name,
        sections: classData.sections.map((s) => ({ name: s.name })),
      });
    }
  }, [classData, reset]);

  const onSubmit = async (data: z.infer<typeof editFormSchema>) => {
    if (!classData) return;

    const updatedData: UpdateClassData = {
      name: data.name,
      section: data.sections.map((s) => s.name).join(","),
    };
    await updateClass(classData.id, updatedData);
    onClassUpdated();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Class Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label>Sections</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 mb-2">
                  <Input {...register(`sections.${index}.name`)} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {errors.sections && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.sections.message}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "" })}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteClassDialog = ({
  isOpen,
  onClose,
  onConfirm,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  className: string;
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this class?
          </AlertDialogTitle>
          <AlertDialogDescription>
            `This action cannot be undone. This will permanently delete the
            class &quot;${className}&quot; and all of its sections.`
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const CreateClassModal = ({
  isOpen,
  onClose,
  onClassCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: () => void;
}) => {
  const { schools, fetchSchools } = useSchoolStore();
  const { createClass } = useClassStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      name: "",
      schoolId: [],
      sections: [{ name: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const onSubmit = async (data: z.infer<typeof createFormSchema>) => {
    const classData: CreateClassData = {
      name: data.name,
      schoolId: data.schoolId,
      section: data.sections.map((s) => s.name).join(","),
    };
    await createClass(classData);
    onClassCreated();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Class Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label>Schools</Label>
              <Controller
                name="schoolId"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    options={schools.map((s) => ({
                      label: s.name,
                      value: s.id,
                    }))}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    placeholder="Select schools"
                  />
                )}
              />
              {errors.schoolId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.schoolId.message}
                </p>
              )}
            </div>
            <div>
              <Label>Sections</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 mb-2">
                  <Input {...register(`sections.${index}.name`)} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {errors.sections && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.sections.message}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "" })}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Class</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ClassesPage = () => {
  const { selectedSchool } = useSchoolStore();
  const { classes, isLoading, error, fetchClasses, deleteClass } =
    useClassStore();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteDialog, setDeleteDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  useEffect(() => {
    if (selectedSchool) {
      fetchClasses(selectedSchool.id);
    }
  }, [selectedSchool, fetchClasses]);

  const handleClassCreated = () => {
    if (selectedSchool) {
      // No need to fetch again, the store is updated optimistically
    }
  };

  const handleClassUpdated = () => {
    if (selectedSchool) {
      // No need to fetch again, the store is updated optimistically
    }
  };

  const handleDeleteClass = (classData: Class) => {
    setSelectedClass(classData);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedClass && selectedSchool) {
      await deleteClass(selectedClass.id);
      setDeleteDialog(false);
      setSelectedClass(null);
    }
  };

  const handleEditClass = (classData: Class) => {
    setSelectedClass(classData);
    setEditModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Classes</span>
            <Button onClick={() => setCreateModalOpen(true)}>
              Add New Class
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : classes.length === 0 ? (
            <p>No classes found for the selected school.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => (
                  <React.Fragment key={classItem.id}>
                    <TableRow>
                      <TableCell>
                        <Accordion type="single" collapsible>
                          <AccordionItem value={classItem.id}>
                            <AccordionTrigger>
                              {classItem.name}
                            </AccordionTrigger>
                            <AccordionContent>
                              <h4 className="font-bold mt-2">Sections:</h4>
                              {classItem.sections &&
                              classItem.sections.length > 0 ? (
                                <ul className="list-disc pl-5">
                                  {classItem.sections.map((section) => (
                                    <li key={section.id}>{section.name}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p>No sections available.</p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClass(classItem)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-2"
                          onClick={() => handleDeleteClass(classItem)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onClassCreated={handleClassCreated}
      />
      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        classData={selectedClass}
        onClassUpdated={handleClassUpdated}
      />
      <DeleteClassDialog
        isOpen={isDeleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={confirmDelete}
        className={selectedClass?.name || ""}
      />
    </div>
  );
};

export default ClassesPage;
