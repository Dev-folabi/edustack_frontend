"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { School, useSchoolStore } from '@/store/schoolStore';
import { schoolService, Staff } from '@/services/schoolService';
import { useToast } from '@/components/ui/Toast';

const formSchema = z.object({
  name: z.string().min(2, { message: "School name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  phone: z.array(z.string()).min(1, { message: "At least one phone number is required." }),
  isActive: z.boolean(),
  adminId: z.string().optional(),
});

interface EditSchoolModalProps {
  school: School;
  children: React.ReactNode;
}

export const EditSchoolModal = ({ school, children }: EditSchoolModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const { updateSchool } = useSchoolStore();
  const { showToast } = useToast();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: school.name,
      email: school.email,
      address: school.address,
      phone: school.phone,
      isActive: school.isActive,
      adminId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch staff when the modal opens
      const fetchStaff = async () => {
        try {
          const response = await schoolService.getStaffBySchool(school.id);
          if (response.success && response.data && response.data.data) {
            setStaff(response.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch staff", error);
        }
      };
      fetchStaff();
      reset({
        name: school.name,
        email: school.email,
        address: school.address,
        phone: school.phone,
        isActive: school.isActive,
      });
    }
  }, [isOpen, school, reset]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateSchool(school.id, values);
      showToast({ title: 'Success', message: 'School updated successfully.', type: 'success' });
      setIsOpen(false);
    } catch (error) {
      showToast({ title: 'Error', message: 'Failed to update school.', type: 'error' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit School: {school.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>School Name</label>
            <Input {...register('name')} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          <div>
            <label>Email</label>
            <Input {...register('email')} />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>
          <div>
            <label>Address</label>
            <Input {...register('address')} />
            {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
          </div>
           <div>
            <label>Phone</label>
            <Input {...register('phone.0')} />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
          </div>
          <div>
            <label>Admin</label>
            <Controller
              name="adminId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.user.id} value={s.user.id}>
                        {s.name} ({s.user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex items-center space-x-2">
            <label>Active</label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
