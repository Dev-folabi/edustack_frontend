"use client";

import React, { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  GraduationCap,
  Users,
  Shield,
  UserPlus,
  School,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { studentService } from "@/services/studentService";
import { StudentRegistrationPayload } from "@/types/student";
import { Class, ClassSection } from "@/services/classService";
import { classService } from "@/services/classService";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const formSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters." }),
    classId: z.string().nonempty({ message: "Class is required." }),
    sectionId: z.string().nonempty({ message: "Section is required." }),
    name: z.string().nonempty({ message: "Name is required." }),
    gender: z.enum(["male", "female"], {
      error: "Gender is required.",
    }),
    dob: z.date({ error: "Date of birth is required." }),
    phone: z.string().nonempty({ message: "Phone number is required." }),
    address: z.string().nonempty({ message: "Address is required." }),
    admission_date: z.date({ error: "Admission date is required." }),
    religion: z.string().nonempty({ message: "Religion is required." }),
    blood_group: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const)
      .optional(),
    father_name: z.string().nonempty({ message: "Father's name is required." }),
    mother_name: z.string().nonempty({ message: "Mother's name is required." }),
    father_occupation: z
      .string()
      .nonempty({ message: "Father's occupation is required." }),
    mother_occupation: z
      .string()
      .nonempty({ message: "Mother's occupation is required." }),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    exist_guardian: z.boolean().default(false),
    guardian_name: z.string().optional(),
    guardian_phone: z.array(z.string()).optional(),
    guardian_email: z.string().email().optional().or(z.literal("")),
    guardian_username: z.string().optional(),
    guardian_password: z.string().optional(),
    guardian_emailOrUsername: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.exist_guardian) {
        // When using an existing guardian, require the guardian's username and password
        return data.guardian_username && data.guardian_password;
      } else {
        return (
          data.guardian_name &&
          data.guardian_email &&
          data.guardian_password &&
          data.guardian_phone &&
          data.guardian_username
        );
      }
    },
    {
      message: "Guardian information is required",
      path: ["guardian_name"],
    }
  );

const AdmissionForm = () => {
  const { selectedSchool } = useAuthStore();
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [csvFile, setCsvFile] = useState<File | null>(null);
  // const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      classId: "",
      sectionId: "",
      name: "",
      phone: "",
      address: "",
      religion: "",
      father_name: "",
      mother_name: "",
      father_occupation: "",
      mother_occupation: "",
      exist_guardian: false,
      guardian_username: "",
    },
  });

  const selectedClassId = form.watch("classId");
  const useExistingGuardian = form.watch("exist_guardian");

  const { showToast } = useToast();
  useEffect(() => {
    if (selectedSchool?.schoolId) {
      classService
        .getClasses(selectedSchool.schoolId)
        .then((res) => {
          if (res.success && res.data) {
            setClasses(res.data.data);
          }
        })
        .catch((error) => {
          showToast({
            type: "error",
            title: "Failed to load classes",
            message: error.message || "Failed to load classes",
          });
          console.error("Error loading classes:", error);
        });
    }
  }, [selectedSchool?.schoolId, showToast]);

  useEffect(() => {
    if (selectedClassId) {
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      setSections(selectedClass?.sections || []);
      form.setValue("sectionId", "");
    } else {
      setSections([]);
    }
  }, [selectedClassId, classes, form]);

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
    const payload: StudentRegistrationPayload = {
      ...values,
      schoolId: selectedSchool.schoolId,
      dob: values.dob.toISOString().split("T")[0],
      admission_date: values.admission_date.toISOString().split("T")[0],
      exist_guardian: values.exist_guardian,
      guardian_phone: values.exist_guardian ? undefined : values.guardian_phone,
      guardian_name: values.exist_guardian ? undefined : values.guardian_name,
      guardian_email: values.exist_guardian ? undefined : values.guardian_email,
      // When linking to an existing guardian, send the guardian username
      guardian_emailOrUsername: values.exist_guardian
        ? values.guardian_username
        : undefined,
    };

    try {
      const response = await studentService.registerStudent(
        selectedSchool.schoolId,
        payload
      );
      if (response.success) {
        showToast({
          type: "success",
          title: "Student registered successfully",
          message: "You can now log in with your credentials.",
        });
        form.reset();
      } else {
        showToast({
          type: "error",
          title: "Registration failed",
          message: response.message || "Failed to register student.",
        });
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Registration failed",
        message: error.message || "Failed to register student.",
      });
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files) {
  //     setCsvFile(event.target.files[0]);
  //   }
  // };

  // const handleBulkUpload = async () => {
  //   if (!csvFile) {
  //     showToast({
  //       type: "error",
  //       title: "Please select a CSV file to upload",
  //       message: "Please select a CSV file to upload.",
  //     });
  //     return;
  //   }
  //   setIsUploading(true);

  //   try {
  //     // Simulate API call - replace with actual implementation
  //     await new Promise((resolve) => setTimeout(resolve, 2000));
  //     showToast({
  //       type: "success",
  //       title: "Bulk upload completed successfully",
  //       message: "You can now log in with your credentials.",
  //     });
  //     setCsvFile(null);
  //     // Reset file input
  //     const fileInput = document.querySelector(
  //       'input[type="file"]'
  //     ) as HTMLInputElement;
  //     if (fileInput) fileInput.value = "";
  //   } catch (error: any) {
  //     showToast({
  //       type: "error",
  //       title: "Bulk upload failed",
  //       message: error.message || "Bulk upload failed. Please try again.",
  //     });
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-2 rounded-xl">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Student Admission
                </h1>
                <p className="text-sm text-gray-500">Register new students</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <School className="h-4 w-4" />
              <span>{selectedSchool?.school.name || "No school selected"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="single" className="space-y-8">
          {/* <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Individual Registration
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Bulk Upload
            </TabsTrigger>
          </TabsList> */}

          <TabsContent value="single">
            <Form {...form}>
              <div onSubmit={handleFormSubmit} className="space-y-8">
                {/* Student Information */}
                <Card className="shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <User className="w-5 h-5 text-blue-600" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter full name"
                                {...field}
                                className="h-11"
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
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter email address"
                                {...field}
                                className="h-11"
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
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter username"
                                {...field}
                                className="h-11"
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
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter password"
                                {...field}
                                className="h-11"
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
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter phone number"
                                {...field}
                                className="h-11"
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
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
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
                          <FormItem className="flex flex-col">
                            <FormLabel className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Date of Birth
                            </FormLabel>
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
                        name="religion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Religion</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter religion"
                                {...field}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="blood_group"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Group</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {bloodGroups.map((group) => (
                                  <SelectItem key={group} value={group}>
                                    {group}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2 lg:col-span-1">
                            <FormLabel className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter address"
                                {...field}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter city"
                                {...field}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter state"
                                {...field}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter country"
                                {...field}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card className="shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="admission_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Admission Date
                            </FormLabel>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select admission date"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="classId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {classes.map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id}>
                                    {cls.name}
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
                        name="sectionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!selectedClassId}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select a section" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sections.map((section) => (
                                  <SelectItem
                                    key={section.id}
                                    value={section.id}
                                  >
                                    {section.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Parent Information */}
                <Card className="shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Users className="w-5 h-5 text-blue-600" />
                      Parent Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="father_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter father's name"
                                {...field}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="father_occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Occupation</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter father's occupation"
                                {...field}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mother_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter mother's name"
                                {...field}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mother_occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Occupation</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter mother's occupation"
                                {...field}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Guardian Information */}
                <Card className="shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Shield className="w-5 h-5 text-amber-600" />
                      Guardian Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <FormField
                      control={form.control}
                      name="exist_guardian"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gray-50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Use Existing Guardian
                            </FormLabel>
                            <p className="text-sm text-gray-500">
                              Toggle this if you want to link to an existing
                              guardian account
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

                    {useExistingGuardian ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="guardian_username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian's Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter guardian's username"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="guardian_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian's Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter guardian's password"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="guardian_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian's Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter guardian's name"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="guardian_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian's Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter guardian's email"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="guardian_phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian's Phone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter phone numbers (comma-separated)"
                                  {...field}
                                  value={field.value?.join(", ") || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter((s) => s)
                                    )
                                  }
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="guardian_username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian's Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter guardian's username"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="guardian_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian's Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter guardian's password"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={isLoading}
                    size="lg"
                    className="min-w-[200px] h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
                  >
                    {isLoading ? "Registering..." : "Register Student"}
                  </Button>
                </div>
              </div>
            </Form>
          </TabsContent>

          {/* <TabsContent value="bulk">
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Upload className="w-5 h-5 text-emerald-600" />
                  Bulk Student Registration
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Upload a CSV file to register multiple students at once.
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="max-w-sm"
                    />
                    <Button
                      onClick={handleBulkUpload}
                      disabled={isUploading}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      {isUploading ? "Uploading..." : "Upload CSV"}
                    </Button>
                  </div>
                  {csvFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected file: {csvFile.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <a href="/student_admission_template.csv" download>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </Button>
                  </a>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Download the template file to see the
                    required format and fields for the CSV upload. Make sure all
                    required fields are filled properly before uploading.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
};

export default AdmissionForm;
