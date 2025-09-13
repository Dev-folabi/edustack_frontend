"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { MultiSelect } from '@/components/ui/multi-select';
import { subjectService } from '@/services/subjectService';
import { schoolService } from '@/services/schoolService';
import { classService } from '@/services/classService';
import { toast } from 'react-hot-toast';

const subjectFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  isActive: z.boolean().default(true),
  schoolIds: z.array(z.string()).min(1, 'At least one school is required'),
  sectionIds: z.array(z.string()).min(1, 'At least one section is required'),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

const EditSubjectPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [subject, setSubject] = useState(null);
  const [schools, setSchools] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
  });

  useEffect(() => {
    const fetchSchools = async () => {
        try {
          const response = await schoolService.getSchools();
          setSchools(response.data.data.map((s: any) => ({ value: s.id, label: s.name })));
        } catch (error) {
          toast.error('Failed to fetch schools');
        }
      };

      const fetchClassesAndSections = async () => {
          try {
            const response = await classService.getClasses();
            const allSections = response.data.flatMap((c: any) =>
              c.sections.map((s: any) => ({ value: s.id, label: `${c.name} - ${s.name}` }))
            );
            setSections(allSections);
          } catch (error) {
            toast.error('Failed to fetch classes and sections');
          }
        };

      fetchSchools();
      fetchClassesAndSections();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchSubject = async () => {
        try {
          setLoading(true);
          const response = await subjectService.getSubject(id as string);
          setSubject(response);
          form.reset(response);
        } catch (error) {
          toast.error('Failed to fetch subject');
        } finally {
          setLoading(false);
        }
      };
      fetchSubject();
    }
  }, [id, form]);



  const onSubmit = async (data: SubjectFormValues) => {
    try {
      await subjectService.updateSubject(id as string, data);
      toast.success('Subject updated successfully');
      router.push('/academics/subjects');
    } catch (error) {
      toast.error('Failed to update subject');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Subject</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mathematics" {...field} />
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
                    <Input placeholder="e.g., MATH101" {...field} />
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
                        defaultValue={field.value || []}
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
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditSubjectPage;
