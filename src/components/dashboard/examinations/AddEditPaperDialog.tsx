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
import { useSubjectStore } from "@/store/subjectStore";
import { useQuestionBankStore } from "@/store/questionBankStore";
import { useEffect } from "react";
import { useExamStore } from "@/store/examStore";
import { addExamPaper, updateExamPaper } from "@/services/examService";
import { useToast } from "@/components/ui/Toast";
import { ExamPaper } from "@/types/exam";

// ✅ Fixed schema with proper number types
const paperSchema = z
  .object({
    subjectId: z.string().min(1, "Subject is required"),
    maxMarks: z.coerce.number().min(1, "Max marks are required"),
    passMarks: z.coerce.number().min(1, "Pass marks are required"),
    paperDate: z.date().refine((d) => !!d, { message: "Paper date is required" }),
    startTime: z.date().refine((d) => !!d, { message: "Start time is required" }),
    endTime: z.date().refine((d) => !!d, { message: "End time is required" }),
    mode: z.enum(["PaperBased", "CBT"]),
    questionBankId: z.string().optional(),
    totalQuestions: z.coerce.number().positive().optional(),
    instructions: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.mode === "CBT") {
        return !!data.questionBankId && !!data.totalQuestions;
      }
      return true;
    },
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
  paper?: ExamPaper;
}

export const AddEditPaperDialog = ({
  isOpen,
  onClose,
  examId,
  paper,
}: AddEditPaperDialogProps) => {
  const { selectedSchool } = useAuthStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  const { questionBanks, fetchQuestionBanksBySubject } = useQuestionBankStore();
  const { fetchExamById } = useExamStore();
  const { showToast } = useToast();


  const form = useForm<PaperFormValues>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      subjectId: paper?.subject?.id || "",
      maxMarks: paper?.maxMarks || 0,
      passMarks: paper?.passMarks || 0,
      paperDate: paper?.paperDate ? new Date(paper.paperDate) : new Date(),
      startTime: paper?.startTime ? new Date(paper.startTime) : new Date(),
      endTime: paper?.endTime ? new Date(paper.endTime) : new Date(),
      mode: paper?.mode || "PaperBased",
      questionBankId: paper?.questionBankId || "",
      totalQuestions: paper?.totalQuestions || undefined,
      instructions: paper?.instructions || "",
    },
  });

  const selectedSubjectId = form.watch("subjectId");
  const selectedMode = form.watch("mode");

  useEffect(() => {
    if (selectedSchool) {
      fetchSubjects(selectedSchool.schoolId);
    }
  }, [selectedSchool, fetchSubjects]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchQuestionBanksBySubject(selectedSubjectId);
    }
  }, [selectedSubjectId, fetchQuestionBanksBySubject]);

  // ✅ Properly typed onSubmit function
  const onSubmit = async (values: PaperFormValues) => {
    try {
      const data = {
        ...values,
        paperDate: values.paperDate.toISOString(),
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
      };

      const response = paper
        ? await updateExamPaper(examId, paper.id, data)
        : await addExamPaper(examId, data);

      if (response.success) {
        showToast({
          title: `Success`,
          message: `Exam paper ${paper ? "updated" : "added"} successfully!`,
          type: "success",
        });
        fetchExamById(examId);
        onClose();
      } else {
        showToast({
          title: "Error",
          message: response.message || "Failed to save exam paper",
          type: "error",
        });
      }
    } catch (error) {
      showToast({
        title: "Error",
        message: "An error occurred while saving the exam paper.",
        type: "error",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{paper ? "Edit" : "Add"} Exam Paper</DialogTitle>
          <DialogDescription>
            Fill in the details for the exam paper.
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
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((s) => (
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

            {/* Marks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Marks</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pass Marks</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Paper Date */}
            <FormField
              control={form.control}
              name="paperDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paper Date</FormLabel>
                  <FormControl>
                    <DateTimePicker date={field.value} setDate={field.onChange} />
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
                    <FormLabel>Start Time</FormLabel>
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
                    <FormLabel>End Time</FormLabel>
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

            {/* Mode */}
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mode" />
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
              <div className="space-y-4 p-4 border rounded-md">
                <FormField
                  control={form.control}
                  name="questionBankId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Bank</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedSubjectId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a question bank" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questionBanks.map((qb) => (
                            <SelectItem key={qb.id} value={qb.id}>
                              {qb.name}
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
                  name="totalQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Questions to Display</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
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
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., All questions are compulsory"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Paper"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};