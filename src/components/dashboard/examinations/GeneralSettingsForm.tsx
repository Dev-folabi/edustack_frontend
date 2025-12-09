"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/Toast";
import { GeneralSettings } from "@/types/examSettings";
import { useExamSettingsStore } from "@/store/examSettingsStore";
import { updateGeneralSettings } from "@/services/examSettingsService";
import { useEffect } from "react";

const settingsSchema = z.object({
  passMark: z.number().min(0).max(100),
  showSchoolRemarks: z.boolean(),
  showTeacherRemarks: z.boolean(),
  enablePsychomotor: z.boolean(),
  enablePosition: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export const GeneralSettingsForm = () => {
  const { generalSettings, fetchGeneralSettings } = useExamSettingsStore();
  const {showToast} = useToast()

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      passMark: 40,
      showSchoolRemarks: true,
      showTeacherRemarks: true,
      enablePsychomotor: true,
      enablePosition: true,
    },
  });

  useEffect(() => {
    fetchGeneralSettings();
  }, [fetchGeneralSettings]);

  useEffect(() => {
    if (generalSettings) {
      form.reset(generalSettings);
    }
  }, [generalSettings, form]);

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      const response = await updateGeneralSettings(values);
      if (response.success) {
        showToast({
          type: "success",
          message: response.message || "General settings updated successfully!",
          title: "Success",
        });
        fetchGeneralSettings();
      } else {
        showToast({
          type: "error",
          message: response.message || "Failed to update settings",
          title: "Error",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message: "An error occurred while updating settings.",
        title: "Error",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="passMark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Pass Mark (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="showSchoolRemarks"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel>Show School Remarks</FormLabel>
                </div>
                <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="showTeacherRemarks"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel>Show Teacher Remarks</FormLabel>
                </div>
                <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enablePsychomotor"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel>Enable Psychomotor Analysis</FormLabel>
                </div>
                <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enablePosition"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel>Enable Position For Student Result</FormLabel>
                </div>
                <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
