"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

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
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";
import { sessionService } from "@/services/sessionService";
import { DASHBOARD_ROUTES } from "@/constants/routes";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";

const termSchema = z.object({
  name: z.string().min(1, "Term name is required."),
  start_date: z.date({ error: "Start date is required." }),
  end_date: z.date({ error: "End date is required." }),
});

const sessionFormSchema = z
  .object({
    name: z.string().min(4, "Session name must be at least 4 characters."),
    start_date: z.date({ error: "Session start date is required." }),
    end_date: z.date({ error: "Session end date is required." }),
    isActive: z.boolean().default(false),
    terms: z.array(termSchema).min(2, "You must add at least two terms."),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return data.start_date < data.end_date;
      }
      return true;
    },
    {
      message: "Session end date must be after the start date.",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true; // Don't validate if session dates aren't set
      for (const term of data.terms) {
        if (!term.start_date || !term.end_date) return true; // Don't validate if term dates aren't set
        if (
          term.start_date < data.start_date ||
          term.end_date > data.end_date
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Term dates must be within the session date range.",
      path: ["terms"],
    }
  )
  .refine(
    (data) => {
      for (let i = 0; i < data.terms.length; i++) {
        for (let j = i + 1; j < data.terms.length; j++) {
          if (
            data.terms[i].start_date < data.terms[j].end_date &&
            data.terms[j].start_date < data.terms[i].end_date
          ) {
            return false; // Overlap detected
          }
        }
      }
      return true;
    },
    { message: "Term dates must not overlap.", path: ["terms"] }
  );

type SessionFormValues = z.infer<typeof sessionFormSchema>;

export const CreateSessionForm = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { selectedSchool } = useAuthStore();
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      isActive: false,
      terms: [
        { name: "First Term", start_date: undefined, end_date: undefined },
        { name: "Second Term", start_date: undefined, end_date: undefined },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "terms",
  });

  const onSubmit = async (values: SessionFormValues) => {
    if (!selectedSchool?.schoolId) {
      showToast({
        title: "Error",
        message: "No school selected. Please select a school first.",
        type: "error",
      });
      return;
    }

    try {
      await sessionService.createSession(values, selectedSchool.schoolId);
      showToast({
        title: "Success",
        message: "Academic session created successfully!",
        type: "success",
      });
      router.push(DASHBOARD_ROUTES.SESSIONS_TERMS);
    } catch (error) {
      showToast({
        title: "Error",
        message: "Failed to create session.",
        type: "error",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">Session Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2024/2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                  <FormLabel>Set as Active Session?</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">Terms</h3>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start space-x-4 p-4 border rounded-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                  <FormField
                    control={form.control}
                    name={`terms.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Term Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`terms.${index}.start_date`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`terms.${index}.end_date`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <FaTrash />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                name: "Third Term",
                start_date: undefined,
                end_date: undefined,
              })
            }
            className="mt-4"
          >
            <FaPlus className="mr-2 h-4 w-4" /> Add Term
          </Button>
          {form.formState.errors.terms && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.terms.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="min-w-[200px]"
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Session"}
          </Button>
          {Object.keys(form.formState.errors).length > 0 && (
            <p className="text-sm text-destructive">
              Please fill in all required fields correctly
            </p>
          )}
        </div>
      </form>
    </Form>
  );
};
