"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
import { schoolService } from "@/services/schoolService";
import { DASHBOARD_ROUTES } from "@/constants/routes";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "School name must be at least 2 characters." }),
  address: z.string().min(5, { message: "Address is required." }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." }),
  phone: z.string().regex(phoneRegex, "Invalid Number!"),
  isActive: z.boolean().default(true),
});

type SchoolFormValues = z.infer<typeof formSchema>;

const CreateSchoolPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      address: "",
      email: "",
      phone: "",
      isActive: true,
    },
  });

  const onSubmit = async (values: SchoolFormValues) => {
    try {
      // The service expects phone as an array of strings
      const dataToSubmit = {
        ...values,
        phone: [values.phone],
      };
      await schoolService.createSchool(dataToSubmit);
      showToast({
        title: "Success",
        message: "School created successfully!",
        type: "success",
      });
      router.push(DASHBOARD_ROUTES.SCHOOL_MANAGEMENT);
    } catch (error: any) {
      showToast({
        title: "Error",
        message: error.message,
        type: "error",
      });
      console.error("Create school error:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add New School</h1>
        <Link href={DASHBOARD_ROUTES.SCHOOL_MANAGEMENT}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-2xl"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Northwood High School" {...field} />
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
                  <Input placeholder="123 Main Street, Anytown" {...field} />
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
                  <Input placeholder="contact@northwoodhigh.edu" {...field} />
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
                  <Input placeholder="(123) 456-7890" {...field} />
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
                  <FormLabel>Active Status</FormLabel>
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save School"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default withAuth(CreateSchoolPage, [UserRole.SUPER_ADMIN]);
