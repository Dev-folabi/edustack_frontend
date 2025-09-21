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
import { useEffect } from "react";
import { useQuestionBankStore } from "@/store/questionBankStore";
import { createQuestionBank, updateQuestionBank } from "@/services/questionBankService";
import { toast } from "sonner";
import { QuestionBank } from "@/types/questionBank";

const questionBankSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  subjectId: z.string().min(1, "Subject is required"),
});

type QuestionBankFormValues = z.infer<typeof questionBankSchema>;

interface CreateEditQuestionBankDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bank?: QuestionBank;
}

export const CreateEditQuestionBankDialog = ({ isOpen, onClose, bank }: CreateEditQuestionBankDialogProps) => {
  const { selectedSchool } = useAuthStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  const { fetchAllQuestionBanks } = useQuestionBankStore();

  const form = useForm<QuestionBankFormValues>({
    resolver: zodResolver(questionBankSchema),
    defaultValues: bank || {
      name: "",
      description: "",
      subjectId: "",
    },
  });

  useEffect(() => {
    if (selectedSchool) {
      fetchSubjects(selectedSchool.schoolId);
    }
  }, [selectedSchool, fetchSubjects]);

  const onSubmit = async (values: QuestionBankFormValues) => {
    if (!selectedSchool) return;

    try {
      const data = { ...values, schoolId: selectedSchool.schoolId };
      const response = bank
        ? await updateQuestionBank(bank.id, data)
        : await createQuestionBank(data);

      if (response.success) {
        toast.success(`Question bank ${bank ? 'updated' : 'created'} successfully!`);
        fetchAllQuestionBanks(selectedSchool.schoolId);
        onClose();
      } else {
        toast.error(response.message || "Failed to save question bank");
      }
    } catch (error) {
      toast.error("An error occurred while saving the question bank.");
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
                    <Input placeholder="e.g., Grade 10 Mathematics" {...field} />
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
                    <Textarea placeholder="A brief description of the question bank" {...field} />
                  </FormControl>
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
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
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
