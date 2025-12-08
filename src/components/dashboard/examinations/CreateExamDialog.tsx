"use client";

import { useState, useEffect } from "react";
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
import { useExamStore } from "@/store/examStore";
import { createExam } from "@/services/examService";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

const examSchema = z.object({
  title: z.string().min(1, "Title is required"),
  startDate: z.date().refine((d) => !!d, { message: "Start date is required" }),
  endDate: z.date().refine((d) => !!d, { message: "End date is required" }),
  classId: z.string().min(1, "Class is required"),
  sectionId: z.string().min(1, "Section is required"),
  termId: z.string().min(1, "Term is required"),
  sessionId: z.string().min(1, "Session is required"),
  status: z.enum(["Draft", "Scheduled"]),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface CreateExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateExamDialog = ({
  isOpen,
  onClose,
}: CreateExamDialogProps) => {
  const router = useRouter();
  const { selectedSchool } = useAuthStore();
  const { classes, fetchClasses } = useClassStore();
  const { selectedSession, fetchSessions, fetchTerms } = useSessionStore();
  const { fetchExams } = useExamStore();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const { showToast } = useToast();

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      startDate: undefined,
      endDate: undefined,
      classId: "",
      sectionId: "",
      termId: "",
      sessionId: selectedSession?.id || "",
      status: "Draft",
    },
  });

  // Fetch school dependencies
  useEffect(() => {
    if (selectedSchool?.schoolId) {
      fetchClasses(selectedSchool.schoolId);
      fetchSessions();
    }
  }, [selectedSchool, fetchClasses, fetchSessions]);

  // Always keep sessionId in sync with selectedSession
  useEffect(() => {
    if (selectedSession?.id) {
      form.setValue("sessionId", selectedSession.id);
      fetchTerms(selectedSession.id);
    }
  }, [selectedSession, form, fetchTerms]);

  const onSubmit = async (values: ExamFormValues) => {
    if (!selectedSchool || !selectedSession) return;

    try {
      const response = await createExam(selectedSchool.schoolId, {
        ...values,
        sessionId: selectedSession.id, // enforce session
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      });

      if (response.success) {
        showToast({
          title: "Success",
          message: "Exam created successfully!",
          type: "success",
        });
        fetchExams(selectedSchool.schoolId, selectedSession.id);
        onClose();
        router.push(`/examinations/manage/${response.data.id}`);
      } else {
        showToast({
          title: "Error",
          message: response.message || "Failed to create exam",
          type: "error",
        });
      }
    } catch (error) {
      showToast({
        title: "Error",
        message: "An error occurred while creating the exam.",
        type: "error",
      });
    }
  };

  const sections = classes.find((c) => c.id === selectedClass)?.sections || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new exam.
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
                    <Input
                      placeholder="e.g., Mid-Term Examination"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
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

            {/* Session & Term */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session</FormLabel>
                    <Select value={selectedSession?.id} disabled>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a session" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedSession?.id && (
                          <SelectItem value={selectedSession.id}>
                            {selectedSession.name}
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

            {/* Class & Section */}
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
                {form.formState.isSubmitting ? "Creating..." : "Create Exam"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
