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
import { toast } from "sonner";
import { GradeCriterion } from "@/types/examSettings";
import { useExamSettingsStore } from "@/store/examSettingsStore";
import {
  createGradeCriterion,
  updateGradeCriterion,
} from "@/services/examSettingsService";

const gradeSchema = z.object({
  name: z.string().min(1, "Grade is required"),
  minScore: z.coerce.number().min(0, "Min score must be 0 or greater"),
  maxScore: z.coerce.number().min(0, "Max score must be 0 or greater"),
  remark: z.string().min(1, { message: "Remark is required" }),
});

type GradeFormValues = z.infer<typeof gradeSchema>;

interface CreateEditGradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  criterion?: GradeCriterion;
}

export const CreateEditGradeDialog = ({
  isOpen,
  onClose,
  criterion,
}: CreateEditGradeDialogProps) => {
  const { fetchGradeCriteria } = useExamSettingsStore();

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: criterion || {
      name: "",
      minScore: 0,
      maxScore: 100,
      remark: "",
    },
  });

  const onSubmit = async (values: GradeFormValues) => {
    try {
      const response = criterion
        ? await updateGradeCriterion(criterion.id, values)
        : await createGradeCriterion(values);

      if (response.success) {
        toast.success(
          `Grade criterion ${criterion ? "updated" : "created"} successfully!`
        );
        fetchGradeCriteria();
        onClose();
      } else {
        toast.error(response.message || "Failed to save grade criterion");
      }
    } catch (error) {
      toast.error("An error occurred while saving the grade criterion.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {criterion ? "Edit" : "Create"} Grade Criterion
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the grade criterion.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A+" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Score</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Score</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remark</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Excellent" {...field} />
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
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
