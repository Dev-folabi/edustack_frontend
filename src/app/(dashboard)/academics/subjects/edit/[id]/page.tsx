"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Loader } from "@/components/ui/Loader";
import { subjectService } from "@/services/subjectService";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

const subjectFormSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  isActive: z.boolean().optional(),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

const EditSubjectPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { selectedSchool } = useAuthStore();

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
  });

  useEffect(() => {
    if (id) {
      const fetchSubject = async () => {
        try {
          setLoading(true);
          const response = await subjectService.getSubject(id as string);
          if (response.success) {
            const subject = response.data;
            form.reset({
              name: subject.name,
              code: subject.code,
              isActive: subject.isActive,
            });
          } else {
            toast.error("Failed to fetch subject details");
            router.back();
          }
        } catch (error) {
          toast.error("Failed to fetch subject details");
          router.back();
        } finally {
          setLoading(false);
        }
      };
      fetchSubject();
    }
  }, [id, form, router]);

  const onSubmit = async (data: SubjectFormValues) => {
    if (!selectedSchool) {
      toast.error("No school selected");
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(updateData).length === 0) {
        toast.error("No changes to save");
        return;
      }

      const response = await subjectService.updateSubject(
        id as string,
        updateData
      );
      if (response.success) {
        toast.success("Subject updated successfully!");
        router.push("/academics/subjects");
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" text="Loading subject details..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 text-3xl font-bold tracking-tight">
          Edit Subject
        </h1>
        <p className="text-gray-500 mt-2 text-base">
          Update the details of the subject for{" "}
          {selectedSchool?.name || "the selected school"}. All fields are
          optional - only update what you need to change.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Mathematics"
                    {...field}
                    className="h-12 px-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., MATH101"
                    {...field}
                    className="h-12 px-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Active Status (Optional)</FormLabel>
                  <p className="text-sm text-gray-600">
                    Toggle to change the subject's active status
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6 py-3 text-sm font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="px-6 py-3 text-sm font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditSubjectPage;
