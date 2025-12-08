"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Class } from "@/services/classService";
import { useClassStore } from "@/store/classStore";
import { useAuthStore } from "@/store/authStore";
import { PlusCircle, XCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters."),
  sections: z.array(z.object({ name: z.string().min(1, "Section name cannot be empty.") })).optional(),
});

interface CreateEditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData?: Class;
}

export const CreateEditClassModal = ({
  isOpen,
  onClose,
  classData,
}: CreateEditClassModalProps) => {
  const { createClass, updateClass } = useClassStore();
  const selectedSchool = useAuthStore((state) => state.selectedSchool);
  const isEditMode = !!classData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: classData?.name || "",
      sections: classData?.sections.map(s => ({ name: s.name })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedSchool?.schoolId) return;

    const sectionString = values.sections && values.sections.length > 0 
      ? values.sections.map(s => s.name).filter(name => name.trim() !== "").join(",")
      : "";

    if (isEditMode) {
        await updateClass(classData.id, { name: values.name, section: sectionString });
    } else {
        await createClass({ name: values.name, section: sectionString, schoolId: [selectedSchool.schoolId] });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Class" : "Create New Class"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Grade 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Sections {isEditMode ? "(Optional)" : ""}</FormLabel>
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`sections.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mt-2">
                        <FormControl>
                          <Input placeholder="e.g., A" {...field} />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={!isEditMode && fields.length <= 1}>
                          <XCircle className="h-5 w-5 text-red-500" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: "" })}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
