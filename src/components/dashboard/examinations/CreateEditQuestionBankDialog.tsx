"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { useSubjectStore } from "@/store/subjectStore";
import { useClassStore } from "@/store/classStore";
import { useEffect, useMemo } from "react";
import { useQuestionBankStore } from "@/store/questionBankStore";
import {
  createQuestionBank,
  updateQuestionBank,
} from "@/services/questionBankService";
import { useToast } from "@/components/ui/Toast";
import { QuestionBank } from "@/types/questionBank";

const questionBankSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  classId: z.string().min(1, "Class is required"),
  sectionId: z.string().min(1, "Section is required"),
  subjectId: z.string().min(1, "Subject is required"),
});

type QuestionBankFormValues = z.infer<typeof questionBankSchema>;

interface CreateEditQuestionBankDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bank?: QuestionBank;
}

export const CreateEditQuestionBankDialog = ({
  isOpen,
  onClose,
  bank,
}: CreateEditQuestionBankDialogProps) => {
  const { selectedSchool } = useAuthStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  const { classes, fetchClasses } = useClassStore();
  const { fetchAllQuestionBanks } = useQuestionBankStore();
  const { showToast } = useToast();

  const form = useForm<QuestionBankFormValues>({
    resolver: zodResolver(questionBankSchema),
    defaultValues: bank || {
      name: "",
      description: "",
      classId: "",
      sectionId: "",
      subjectId: "",
    },
  });

  const selectedClassId = form.watch("classId");
  const selectedSectionId = form.watch("sectionId");

  // Compute available sections based on selected class
  const availableSections = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedClass = classes.find((c) => c.id === selectedClassId);
    return selectedClass?.sections || [];
  }, [selectedClassId, classes]);

  useEffect(() => {
    if (selectedSchool?.schoolId) {
      fetchClasses(selectedSchool.schoolId);
    }
  }, [selectedSchool, fetchClasses]);

  useEffect(() => {
    if (selectedSchool && selectedSectionId) {
      fetchSubjects(selectedSchool.schoolId, selectedSectionId);
    }
  }, [selectedSchool, selectedSectionId, fetchSubjects]);

  // Clear section and subject when class changes
  useEffect(() => {
    form.setValue("sectionId", "");
    form.setValue("subjectId", "");
  }, [selectedClassId, form]);

  // Clear subject when section changes
  useEffect(() => {
    form.setValue("subjectId", "");
  }, [selectedSectionId, form]);

  const onSubmit = async (values: QuestionBankFormValues) => {
    if (!selectedSchool?.schoolId) return;

    try {
      const data = { ...values, schoolId: selectedSchool.schoolId };
      const response = bank
        ? await updateQuestionBank(bank.id, data)
        : await createQuestionBank(data);

      if (response.success) {
        showToast({
          type: "success",
          title: "Success",
          message: `Question bank ${
            bank ? "updated" : "created"
          } successfully!`,
        });
        fetchAllQuestionBanks(selectedSchool.schoolId);
        onClose();
      } else {
        showToast({
          type: "error",
          title: "Error",
          message: response.message || "Failed to save question bank",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while saving the question bank.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{bank ? "Edit" : "Create"} Question Bank</DialogTitle>
          <DialogDescription>
            Fill in the details for the question bank.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Grade 10 Mathematics"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of the question bank"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.length > 0 ? (
                        classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-classes" disabled>
                          No classes available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedClassId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a section" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSections.length > 0 ? (
                        availableSections.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-sections" disabled>
                          No sections available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedSectionId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.length > 0 ? (
                        subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-subjects" disabled>
                          No subjects available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
