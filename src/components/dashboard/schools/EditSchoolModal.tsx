"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/Toast';
import { schoolService } from '@/services/schoolService';
import { useAuthStore, School } from '@/store/authStore';

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z.object({
  name: z.string().min(2, { message: "School name must be at least 2 characters." }),
  address: z.string().min(5, { message: "Address is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().regex(phoneRegex, 'Invalid Number!'),
  isActive: z.boolean().default(true),
});

type SchoolFormValues = z.infer<typeof formSchema>;

interface EditSchoolModalProps {
  school: School | null;
  onClose: () => void;
}

export const EditSchoolModal = ({ school, onClose }: EditSchoolModalProps) => {
  const { showToast } = useToast();
  const { loadSchools } = useAuthStore();
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(formSchema),
    values: {
        name: school?.name || '',
        address: school?.address || '',
        email: school?.email || '',
        phone: school?.phone[0] || '',
        isActive: school?.isActive || false,
    }
  });

  const onSubmit = async (values: SchoolFormValues) => {
    if (!school) return;

    try {
      const dataToSubmit = {
        ...values,
        phone: [values.phone],
      };
      await schoolService.updateSchool(school.id, dataToSubmit);
      showToast({
        title: 'Success',
        message: 'School updated successfully!',
        type: 'success',
      });
      await loadSchools();
      onClose();
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to update school. Please try again.',
        type: 'error',
      });
      console.error('Update school error:', error);
    }
  };

  return (
    <Dialog open={!!school} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit School</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Active Status</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
