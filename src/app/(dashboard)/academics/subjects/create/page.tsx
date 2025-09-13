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
import { schoolService } from '@/services/schoolService';
import { classService } from '@/services/classService';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const subjectFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  isActive: z.boolean().default(true),
  schoolIds: z.array(z.string()).min(1, 'At least one school is required'),
  sectionIds: z.array(z.string()).min(1, 'At least one section is required'),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

const CreateSubjectPage = () => {
  const router = useRouter();
  const [schools, setSchools] = useState<{ value: string; label: string }[]>([]);
  const [sections, setSections] = useState<{ value: string; label: string }[]>([]);

  const { selectedSchool } = useAuthStore();

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: '',
      code: '',
      isActive: true,
      schoolIds: selectedSchool ? [selectedSchool.id] : [],
      sectionIds: [],
    },
  });

  const fetchSchools = useCallback(async () => {
    try {
      const response = await schoolService.getSchools();
      if (response.success) {
        setSchools(response.data.data.map((s: any) => ({ value: s.id, label: s.name })));
      }
    } catch (error) {
      toast.error('Failed to fetch schools');
    }
  }, []);

  const fetchClassesAndSections = useCallback(async () => {
    if (!selectedSchool) return;
    try {
      const response = await classService.getClasses(selectedSchool.id);
      if (response.success) {
        const allSections = response.data.data.flatMap((c: any) =>
          c.sections.map((s: any) => ({ value: s.id, label: `${c.name} - ${s.name}` }))
        );
        setSections(allSections);
      }
    } catch (error) {
      toast.error('Failed to fetch classes and sections');
    }
  }, [selectedSchool]);

  useEffect(() => {
    fetchSchools();
    fetchClassesAndSections();
  }, [fetchSchools, fetchClassesAndSections]);

  const onSubmit = async (data: SubjectFormValues) => {
    try {
      const response = await subjectService.createSubject(data);
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

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
            <h1 className="text-gray-900 text-3xl font-bold tracking-tight">Create Subject</h1>
            <p className="text-gray-500 mt-2 text-base">Fill in the details to create a new subject.</p>
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
                name="schoolIds"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Schools</FormLabel>
                    <MultiSelect
                        options={schools}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        placeholder="Select schools"
                    />
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
                        defaultValue={field.value}
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
