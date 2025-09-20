"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ClassSection } from "@/services/classService";
import { useClassStore } from "@/store/classStore";
import { useToast } from "@/components/ui/Toast";
import { FaTrash, FaUser, FaCalendar, FaSchool } from "react-icons/fa";
import { ButtonLoader } from "@/components/ui/Loader";

const formSchema = z.object({
  name: z.string().min(1, "Section name cannot be empty."),
  teacherId: z.string().optional(),
});

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: ClassSection;
}

export const EditSectionModal = ({
  isOpen,
  onClose,
  section,
}: EditSectionModalProps) => {
  const { teachers, updateSection, deleteSection, isLoading } = useClassStore();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: section.name,
      teacherId: section.teacherId || "none",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      await updateSection(section.id, {
        name: values.name,
        teacherId: values.teacherId === "none" ? undefined : values.teacherId,
      });
      showToast({
        type: "success",
        title: "Success",
        message: "Section updated successfully!",
      });
      onClose();
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update section. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSection(section.id);
      showToast({
        type: "success",
        title: "Success",
        message: "Section deleted successfully!",
      });
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to delete section. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const assignedTeacher = teachers?.find(t => t.id === section.teacherId);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">Edit Section</DialogTitle>
          </DialogHeader>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-1">
            {/* Section Details Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FaSchool className="text-blue-600" />
                  Section Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-500 text-sm" />
                      <span className="text-sm font-medium text-gray-700">Section Name:</span>
                    </div>
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {section.name}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-500 text-sm" />
                      <span className="text-sm font-medium text-gray-700">Assigned Teacher:</span>
                    </div>
                    <Badge 
                      variant={assignedTeacher ? "default" : "secondary"} 
                      className="text-base px-3 py-1"
                    >
                      {assignedTeacher ? assignedTeacher.name : "No Teacher Assigned"}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-gray-500 text-sm" />
                    <span className="text-sm text-gray-600">Section ID: {section.id}</span>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-2 hover:bg-red-600 transition-colors"
                  >
                    <FaTrash className="text-sm" />
                    Remove Section
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Edit Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Edit Section Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Section Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., A" 
                              {...field} 
                              className="text-base"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="teacherId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Class Teacher</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-base">
                                <SelectValue placeholder="Select a teacher" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              <SelectItem value="none">No Teacher</SelectItem>
                              {teachers && teachers.length > 0 ? (
                                teachers.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-teachers" disabled>
                                  No teachers available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* Fixed Footer */}
          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="w-full sm:w-auto"
                disabled={isSaving || isDeleting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSaving || isDeleting}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <ButtonLoader />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete section "{section.name}"? This action cannot be undone and will permanently remove the section and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <ButtonLoader />
                  Deleting...
                </>
              ) : (
                "Delete Section"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
