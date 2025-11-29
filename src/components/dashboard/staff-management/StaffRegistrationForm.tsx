"use client";

import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/DatePicker";
import { User, Briefcase, UserPlus, School, Upload } from "lucide-react";
import { staffService } from "@/services/staffService";
import { StaffRegistrationPayload } from "@/types/staff";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";

const roles = ["admin", "teacher", "finance", "librarian"];
const genders = ["male", "female"];

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." }),
  name: z.string().nonempty({ message: "Name is required." }),
  phone: z.array(z.string()).nonempty({ message: "Phone number is required." }),
  address: z.string().nonempty({ message: "Address is required." }),
  role: z.enum(["admin", "teacher", "finance", "librarian"], {
    required_error: "Role is required.",
  }),
  designation: z.string().nonempty({ message: "Designation is required." }),
  dob: z.date({ required_error: "Date of birth is required." }),
  salary: z.coerce
    .number()
    .min(0, { message: "Salary must be a positive number." }),
  joining_date: z.date({ required_error: "Joining date is required." }),
  gender: z.enum(["male", "female"], {
    required_error: "Gender is required.",
  }),
  isActive: z.boolean().default(true),
  qualification: z.string().nonempty({ message: "Qualification is required." }),
  notes: z.string().optional(),
  photo: z.any().optional(),
});

const StaffRegistrationForm = () => {
  const { selectedSchool } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      name: "",
      phone: [],
      address: "",
      designation: "",
      salary: 0,
      qualification: "",
      notes: "",
      isActive: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedSchool?.schoolId) {
      showToast({
        type: "error",
        title: "School not selected",
        message: "Please select a school.",
      });
      return;
    }

    setIsLoading(true);
    const payload: StaffRegistrationPayload = {
      schoolId: selectedSchool.schoolId,
      ...values,
      dob: values.dob.toISOString().split("T")[0],
      joining_date: values.joining_date.toISOString().split("T")[0],
    };

    try {
      const response = await staffService.createStaff(payload);
      if (response.success) {
        showToast({
          type: "success",
          title: "Staff registered successfully",
          message: "Staff can now log in with their credentials.",
        });
        form.reset();
      } else {
        showToast({
          type: "error",
          title: "Registration failed",
          message: response.message || "Failed to register staff.",
        });
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Registration failed",
        message: error.message || "Failed to register staff.",
      });
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:h-16 gap-3 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Staff Registration
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Register new staff members
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <School className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate max-w-[200px] sm:max-w-none">
                {selectedSchool?.school.name || "No school selected"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-8"
          >
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Form fields for personal information */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            placeholder="Enter full name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            placeholder="Enter username"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            type="password"
                            placeholder="Enter password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            placeholder="Enter phone number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value.split(","))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genders.map((gender) => (
                              <SelectItem key={gender} value={gender}>
                                {gender.charAt(0).toUpperCase() +
                                  gender.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col min-w-0">
                        <FormLabel>Date of Birth</FormLabel>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select date of birth"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            placeholder="Enter address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            placeholder="Enter designation"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="joining_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col min-w-0">
                        <FormLabel>Joining Date</FormLabel>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select joining date"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="qualification"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            placeholder="Enter qualification"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Salary</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            type="number"
                            placeholder="Enter salary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            placeholder="Enter notes"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  Photo Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Staff Photo</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          type="file"
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isLoading ? "Registering..." : "Register Staff"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default StaffRegistrationForm;
