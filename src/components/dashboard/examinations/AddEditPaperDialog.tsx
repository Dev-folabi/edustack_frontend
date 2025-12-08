"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useMemo } from "react";
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
import { useSubjectStore } from "@/store/subjectStore";
import { useQuestionBankStore } from "@/store/questionBankStore";
import { useExamStore } from "@/store/examStore";
import { addExamPaper, updateExamPaper } from "@/services/examService";
import { useToast } from "@/components/ui/Toast";
import { ExamPaper } from "@/types/exam";


const paperSchema = z
  .object({
    subjectId: z.string().min(1, "Subject is required"),
    maxMarks: z.coerce.number().min(1, "Max marks must be at least 1"),
    paperDate: z.date({ error: "Paper date is required" }),
    startTime: z.date({ error: "Start time is required" }),
    endTime: z.date({ error: "End time is required" }),
    mode: z.enum(["PaperBased", "CBT"], {
      error: "Exam mode is required",
    }),
    questionBankId: z.string().optional().nullable(),
    totalQuestions: z.coerce
      .number()
      .positive("Total questions must be positive")
      .optional()
      .nullable(),
    instructions: z.string().optional().nullable(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine(
    (data) =>
      data.mode === "PaperBased" ||
      (!!data.questionBankId && !!data.totalQuestions),
    {
      message: "Question bank and total questions are required for CBT mode",
      path: ["questionBankId"],
    }
  );

type PaperFormValues = z.infer<typeof paperSchema>;

interface AddEditPaperDialogProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  sectionId?: string;
  paper?: ExamPaper;
}

export const AddEditPaperDialog = ({
  isOpen,
  onClose,
  examId,
  paper,
  sectionId,
}: AddEditPaperDialogProps) => {
  const { selectedSchool } = useAuthStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  const { questionBanks, fetchQuestionBanksBySubject } = useQuestionBankStore();
  const { fetchExamById } = useExamStore();
  const { showToast } = useToast();

  const defaultValues = useMemo<PaperFormValues>(
    () => ({
      subjectId: paper?.subject?.id || "",
      maxMarks: paper?.maxMarks || 10,
      paperDate: paper?.paperDate ? new Date(paper.paperDate) : new Date(),
      startTime: paper?.startTime ? new Date(paper.startTime) : new Date(),
      endTime: paper?.endTime
        ? new Date(paper.endTime)
        : new Date(Date.now() + 3600000), // 1 hour later
      mode: paper?.mode || "PaperBased",
      questionBankId: paper?.questionBankId || null,
      totalQuestions: paper?.totalQuestions || null,
      instructions: paper?.instructions || "",
    }),
    [paper]
  );

  const form = useForm<PaperFormValues>({
    resolver: zodResolver(paperSchema),
    defaultValues,
    mode: "onChange", // Validate on change for better UX
  });

  const selectedSubjectId = form.watch("subjectId");
  const selectedMode = form.watch("mode");

  /* Fetch Data */
  useEffect(() => {
    if (selectedSchool?.schoolId) fetchSubjects(selectedSchool.schoolId, sectionId);
  }, [selectedSchool, fetchSubjects]);

  useEffect(() => {
    if (selectedSubjectId) fetchQuestionBanksBySubject(selectedSubjectId);
  }, [selectedSubjectId, fetchQuestionBanksBySubject]);

  // Reset form when dialog opens/closes or paper changes
  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [isOpen, defaultValues, form]);

  // Clear CBT fields when switching to PaperBased
  useEffect(() => {
    if (selectedMode === "PaperBased") {
      form.setValue("questionBankId", null);
      form.setValue("totalQuestions", null);
    }
  }, [selectedMode, form]);

  /* Submit Handler */
  const onSubmit = async (values: PaperFormValues) => {
    try {
      const payload = {
        ...values,
        paperDate: values.paperDate.toISOString(),
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        questionBankId: values.questionBankId || undefined,
        totalQuestions: values.totalQuestions || undefined,
        instructions: values.instructions || undefined,
      };

      const response = paper
        ? await updateExamPaper(examId, paper.id, payload)
        : await addExamPaper(examId, payload);

      if (response.success) {
        showToast({
          title: "Success",
          message: `Exam paper ${paper ? "updated" : "added"} successfully!`,
          type: "success",
        });
        fetchExamById(examId);
        form.reset();
        onClose();
      } else {
        showToast({
          title: "Error",
          message: response.message || "Failed to save exam paper",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error saving exam paper:", error);
      showToast({
        title: "Error",
        message: "An error occurred while saving the exam paper.",
        type: "error",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {paper ? "Edit" : "Add"} Exam Paper
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the exam paper. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Subject */}
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Subject <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
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
                            {s.name} ({s.code})
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

            {/* Max Marks */}
            <FormField
              control={form.control}
              name="maxMarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Max Marks <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Paper Date */}
            <FormField
              control={form.control}
              name="paperDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Paper Date <span className="text-red-500">*</span>
                  </FormLabel>
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

            {/* Start & End Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Start Time <span className="text-red-500">*</span>
                    </FormLabel>
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
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      End Time <span className="text-red-500">*</span>
                    </FormLabel>
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

            {/* Exam Mode */}
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Exam Mode <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PaperBased">Paper-Based</SelectItem>
                      <SelectItem value="CBT">
                        Computer-Based Test (CBT)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CBT Extra Fields */}
            {selectedMode === "CBT" && (
              <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
                <p className="text-sm font-medium text-blue-900">
                  CBT Configuration
                </p>
                <FormField
                  control={form.control}
                  name="questionBankId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Question Bank <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={!selectedSubjectId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a question bank" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questionBanks.length > 0 ? (
                            questionBanks.map((qb) => (
                              <SelectItem key={qb.id} value={qb.id}>
                                {qb.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-banks" disabled>
                              No question banks available
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
                  name="totalQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Total Questions <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="e.g., 50"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., All questions are compulsory"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !form.formState.isValid}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save Paper"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};