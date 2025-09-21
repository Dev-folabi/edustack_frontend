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
import { toast } from "sonner";
import { ExamPaper } from "@/types/exam";

const paperSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  maxMarks: z.coerce.number().min(1, "Max marks are required"),
  passMarks: z.coerce.number().min(1, "Pass marks are required"),
  startTime: z.date({ required_error: "Start time is required" }),
  endTime: z.date({ required_error: "End time is required" }),
  mode: z.enum(["PAPER_BASED", "CBT"]),
  questionBankId: z.string().optional(),
  totalQuestions: z.coerce.number().optional(),
  instructions: z.string().optional(),
}).refine(data => {
    if (data.mode === 'CBT') {
        return !!data.questionBankId && !!data.totalQuestions;
    }
    return true;
}, {
    message: "Question bank and total questions are required for CBT mode",
    path: ["questionBankId"],
});

type PaperFormValues = z.infer<typeof paperSchema>;

interface AddEditPaperDialogProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  paper?: ExamPaper;
}

export const AddEditPaperDialog = ({ isOpen, onClose, examId, paper }: AddEditPaperDialogProps) => {
  const { selectedSchool } = useAuthStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  const { questionBanks, fetchQuestionBanks } = useQuestionBankStore();
  const { fetchExamById } = useExamStore();

  const form = useForm<PaperFormValues>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      mode: 'PAPER_BASED',
      ...paper,
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
      fetchQuestionBanks(selectedSubjectId);
    }
  }, [selectedSubjectId, fetchQuestionBanks]);

  const onSubmit = async (values: PaperFormValues) => {
    try {
      const data = {
        ...values,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
      };

      const response = paper
        ? await updateExamPaper(examId, paper.id, data)
        : await addExamPaper(examId, data);

      if (response.success) {
        toast.success(`Exam paper ${paper ? 'updated' : 'added'} successfully!`);
        fetchExamById(examId);
        onClose();
      } else {
        toast.error(response.message || "Failed to save exam paper");
      }
    } catch (error) {
      toast.error("An error occurred while saving the exam paper.");
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
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Marks</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                                <DateTimePicker date={field.value} setDate={field.onChange} />
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
                                <DateTimePicker date={field.value} setDate={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PAPER_BASED">Paper-Based</SelectItem>
                      <SelectItem value="CBT">Computer-Based Test (CBT)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedMode === 'CBT' && (
              <div className="space-y-4 p-4 border rounded-md">
                <FormField
                  control={form.control}
                  name="questionBankId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Bank</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedSubjectId}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a question bank" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questionBanks.map(qb => (
                            <SelectItem key={qb.id} value={qb.id}>{qb.name}</SelectItem>
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
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., All questions are compulsory" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
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
