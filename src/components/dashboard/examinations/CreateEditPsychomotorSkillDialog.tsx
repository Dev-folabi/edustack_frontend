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
import { useToast } from "@/components/ui/Toast";
import { PsychomotorSkill } from "@/types/examSettings";
import { useExamSettingsStore } from "@/store/examSettingsStore";
import {
  createPsychomotorSkill,
  updatePsychomotorSkill,
} from "@/services/examSettingsService";

const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type SkillFormValues = z.infer<typeof skillSchema>;

interface CreateEditPsychomotorSkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  skill?: PsychomotorSkill;
}

export const CreateEditPsychomotorSkillDialog = ({
  isOpen,
  onClose,
  skill,
}: CreateEditPsychomotorSkillDialogProps) => {
  const { fetchPsychomotorSkills } = useExamSettingsStore();
  const { showToast } = useToast();

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: skill || {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: SkillFormValues) => {
    try {
      const response = skill
        ? await updatePsychomotorSkill(skill.id, values)
        : await createPsychomotorSkill({
            ...values,
            description: values.description || "",
          });

      if (response.success) {
        showToast({
          type: "success",
          title: "Success",
          message: `Psychomotor skill ${
            skill ? "updated" : "created"
          } successfully!`,
        });
        fetchPsychomotorSkills();
        onClose();
      } else {
        showToast({
          type: "error",
          title: "Error",
          message: response.message || "Failed to save skill",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: "An error occurred while saving the skill.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {skill ? "Edit" : "Create"} Psychomotor Skill
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the psychomotor skill.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Punctuality" {...field} />
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
                      placeholder="A brief description of the skill"
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
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
