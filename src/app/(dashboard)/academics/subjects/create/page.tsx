"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { MultiSelect } from '@/components/ui/multi-select';
import { subjectService } from '@/services/subjectService';
import { classService } from '@/services/classService';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Loader } from '@/components/ui/Loader';

const subjectFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  isActive: z.boolean().default(true),
  sectionIds: z.array(z.string()).min(1, 'At least one section is required'),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

const CreateSubjectPage = () => {
  const router = useRouter();
  const [sections, setSections] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const { selectedSchool } = useAuthStore();

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: '',
      code: '',
      isActive: true,
      sectionIds: [],
    },
  });

  const fetchClassesAndSections = useCallback(async () => {
    if (!selectedSchool) return;
    try {
      setLoading(true);
      const response = await classService.getClasses(selectedSchool.schoolId);
      if (response.success) {
        const allSections = response.data.data.flatMap((c: any) =>
          c.sections.map((s: any) => ({ value: s.id, label: `${c.name} - ${s.name}` }))
        );
        setSections(allSections);
      }
    } catch (error) {
      toast.error('Failed to fetch classes and sections');
    } finally {
      setLoading(false);
    }
  }, [selectedSchool]);

  useEffect(() => {
    fetchClassesAndSections();
  }, [fetchClassesAndSections]);

  const onSubmit = async (data: SubjectFormValues) => {
    if (!selectedSchool) {
      toast.error('No school selected');
      return;
    }

    try {
      const subjectData = {
        ...data,
        schoolIds: [selectedSchool.schoolId],
      };
      const response = await subjectService.createSubject(subjectData);
      if (response.success) {
        toast.success('Subject created successfully');
        router.push('/academics/subjects');
      } else {
        toast.error(response.message || 'Failed to create subject');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subject');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" text="Loading form data..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
            <h1 className="text-gray-900 text-3xl font-bold tracking-tight">Create Subject</h1>
            <p className="text-gray-500 mt-2 text-base">Add a new subject for {selectedSchool?.name || 'the selected school'}.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mathematics" {...field} className="h-12 px-4" />
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
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., MATH101" {...field} className="h-12 px-4" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="sectionIds"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Sections</FormLabel>
                    <MultiSelect
                        options={sections}
                        onValueChange={field.onChange}
                        defaultValue={field.value || []}
                        placeholder="Select sections"
                    />
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
                    <FormLabel>Active</FormLabel>
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
                <Button type="button" variant="outline" onClick={() => router.back()} className="px-6 py-3 text-sm font-semibold">
                    Cancel
                </Button>
                <Button type="submit" className="px-6 py-3 text-sm font-semibold">
                    Create Subject
                </Button>
            </div>
          </form>
        </Form>
    </div>
  );
};

export default CreateSubjectPage;
