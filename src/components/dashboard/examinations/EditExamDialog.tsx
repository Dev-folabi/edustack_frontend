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
  startDate: z.date().refine((d) => !!d, { message: "Start date is required" }),
  endDate: z.date().refine((d) => !!d, { message: "End date is required" }),
  classId: z.string().min(1, "Class is required"),
  sectionId: z.string().min(1, "Section is required"),
  termId: z.string().min(1, "Term is required"),
  sessionId: z.string().min(1, "Session is required"),
  status: z.enum(["Draft", "Scheduled", "Ongoing", "Completed", "Cancelled"]),
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
  const { selectedSession, fetchTerms } = useSessionStore();
  const { fetchExams } = useExamStore();
  const { showToast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>(
    exam?.classId || ""
  );

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: exam.title,
      startDate: new Date(exam.startDate),
      endDate: new Date(exam.endDate),
      classId: exam?.classId || "",
      sectionId: exam?.sectionId || "",
      termId: exam?.termId || "",
      sessionId: selectedSession?.id || "", // always lock to selectedSession
      status: exam.status,
    },
  });

  // Fetch data when dialog opens
  useEffect(() => {
    if (isOpen && selectedSchool?.schoolId) {
      fetchClasses(selectedSchool.schoolId);
      if (selectedSession?.id) {
        fetchTerms(selectedSession.id, selectedSchool?.schoolId);
      }
    }
  }, [isOpen, selectedSchool, selectedSession, fetchClasses, fetchTerms]);

  // Reset form whenever exam or session changes
  useEffect(() => {
    if (exam && selectedSession) {
      form.reset({
        title: exam.title,
        startDate: new Date(exam.startDate),
        endDate: new Date(exam.endDate),
        classId: exam?.classId || "",
        sectionId: exam?.sectionId || "",
        termId: exam?.termId || "",
        sessionId: selectedSession.id, // force current session
        status: exam.status,
      });
      setSelectedClass(exam?.classId || "");
    }
  }, [exam, selectedSession, form]);

  const onSubmit = async (values: ExamFormValues) => {
    if (!selectedSchool || !selectedSession) return;

    try {
      const response = await updateExam(exam.id, {
        ...values,
        sessionId: selectedSession.id,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      });

      if (response.success) {
        showToast({
          title: "Success",
          type: "success",
          message: "Exam updated successfully!",
        });
        fetchExams(selectedSchool?.schoolId || "", selectedSession.id);
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
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the exam.",
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
            {/* Title */}
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
                      {exam.status === "Completed" ? (
                        <>
                          <SelectItem value="Ongoing">Ongoing</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </>
                      )}
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

            {/* Session (locked to selectedSession) */}
            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session</FormLabel>
                  <Select disabled value={selectedSession?.id}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {selectedSession?.name || "No session selected"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedSession && (
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

            {/* Term */}
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

            {/* Class + Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        setSelectedClass(val);
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
                        {sections.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer */}
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
