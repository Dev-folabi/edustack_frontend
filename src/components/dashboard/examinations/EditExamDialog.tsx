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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { useAuthStore } from "@/store/authStore";
import { useClassStore } from "@/store/classStore";
import { useSessionStore } from "@/store/sessionStore";
import { useEffect, useState } from "react";
import { useExamStore } from "@/store/examStore";
import { updateExam } from "@/services/examService";
import { useToast } from "@/components/ui/Toast";
import { Exam } from "@/types/exam";

const examSchema = z.object({
  title: z.string().min(1, "Title is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  classId: z.string().min(1, "Class is required"),
  sectionId: z.string().min(1, "Section is required"),
  termId: z.string().min(1, "Term is required"),
  sessionId: z.string().min(1, "Session is required"),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface EditExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
}

export const EditExamDialog = ({
  isOpen,
  onClose,
  exam,
}: EditExamDialogProps) => {
  const { selectedSchool } = useAuthStore();
  const { classes, fetchClasses } = useClassStore();
  const { selectedSession, fetchSessions, fetchTerms } = useSessionStore();
  const { fetchExams } = useExamStore();
  const [selectedClass, setSelectedClass] = useState<string>(exam.class.id);
  const { showToast } = useToast();

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: exam.title,
      startDate: new Date(exam.startDate),
      endDate: new Date(exam.endDate),
      classId: exam.class.id,
      sectionId: exam.section.id,
      termId: exam.term.id,
      sessionId: exam.session.id,
    },
  });

  useEffect(() => {
    if (selectedSchool) {
      fetchClasses(selectedSchool.schoolId);
      fetchSessions();
    }
  }, [selectedSchool, fetchClasses, fetchSessions]);

  useEffect(() => {
    if (form.watch("sessionId")) {
      fetchTerms(form.watch("sessionId"));
    }
  }, [form.watch("sessionId"), fetchTerms]);

  useEffect(() => {
    if (exam) {
      form.reset({
        title: exam.title,
        startDate: new Date(exam.startDate),
        endDate: new Date(exam.endDate),
        classId: exam.class.id,
        sectionId: exam.section.id,
        termId: exam.term.id,
        sessionId: exam.session.id,
      });
      setSelectedClass(exam.class.id);
    }
  }, [exam, form]);

  const onSubmit = async (values: ExamFormValues) => {
    if (!selectedSchool) return;

    try {
      const response = await updateExam(exam.id, {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      });
      if (response.success) {
        showToast({
          title: "Success",
          type: "success",
          message: "Exam updated successfully!",
        });
        fetchExams(selectedSchool.schoolId, selectedSession?.id!);
        onClose();
      } else {
        showToast({
          title: "Error",
          type: "error",
          message: response.message || "Failed to update exam",
        });
      }
    } catch (error) {
      showToast({
        title: "Error",
        type: "error",
        message: "An error occurred while updating the exam.",
      });
    }
  };

  const sections = classes.find((c) => c.id === selectedClass)?.sections || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
          <DialogDescription>
            Update the details of the exam below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a session" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedSession?.id && (
                          <SelectItem
                            key={selectedSession?.id!}
                            value={selectedSession?.id}
                          >
                            {selectedSession?.name}
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
                name="termId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedSession?.terms?.map((term) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedClass(value);
                        form.setValue("sectionId", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
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
                      value={field.value}
                      disabled={!selectedClass}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
