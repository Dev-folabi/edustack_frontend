"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { staffService } from "@/services/staffService";
import { Staff } from "@/types/staff";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";

// UI
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import {
  Edit,
  Save,
  X,
  Printer,
  FileText,
  User,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  GraduationCap,
  FileText as NotesIcon,
  ArrowLeft,
} from "lucide-react";
import router from "next/router";

const roles = ["admin", "teacher", "finance", "librarian"];
const genders = ["male", "female"];

const formSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  name: z.string().optional(),
  phone: z.array(z.string()).optional(),
  address: z.string().optional(),
  role: z.enum(["admin", "teacher", "finance", "librarian"]).optional(),
  designation: z.string().optional(),
  dob: z.date().optional(),
  salary: z.coerce.number().min(0).optional(),
  joining_date: z.date().optional(),
  gender: z.enum(["male", "female"]).optional(),
  isActive: z.boolean().optional(),
  qualification: z.string().optional(),
  notes: z.string().optional(),
  photo: z.any().optional(),
});

const StaffProfilePage = () => {
  const { staffId } = useParams();
  const { selectedSchool } = useAuthStore();
  const { showToast } = useToast();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalValues, setOriginalValues] = useState<any>(null);
  const [isUpdated, setIsUpdated] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchStaff = async () => {
      if (!selectedSchool?.schoolId || !staffId) return;
      setIsLoading(true);
      try {
        const res = await staffService.getStaffById(
          selectedSchool.schoolId,
          staffId as string
        );
        const s = res.data;

        const primaryRole = s?.user?.userSchools?.[0]?.role || "";
        const formData = {
          ...s,
          email: s?.user?.email || "",
          username: s?.user?.username || "",
          role: primaryRole as any,
          dob: s?.dob ? new Date(s?.dob) : undefined,
          joining_date: s?.joining_date ? new Date(s?.joining_date) : undefined,
        };

        form.reset(formData);
        setOriginalValues(formData);
        setStaff(s);
        setIsUpdated(false);
        setIsEditing(false);
      } catch (error: any) {
        showToast({
          type: "error",
          title: "Error",
          message: error.message || "Failed to fetch staff details.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaff();
  }, [selectedSchool?.schoolId, staffId, form, showToast, isUpdated]);

  const getChangedFields = (currentValues: any, originalValues: any) => {
    const changedFields: any = {};

    Object.keys(currentValues).forEach((key) => {
      const current = currentValues[key];
      const original = originalValues[key];

      // Handle dates specially
      if (current instanceof Date && original instanceof Date) {
        if (current.getTime() !== original.getTime()) {
          changedFields[key] = current;
        }
      }
      // Handle arrays (like phone numbers)
      else if (Array.isArray(current) && Array.isArray(original)) {
        if (JSON.stringify(current) !== JSON.stringify(original)) {
          changedFields[key] = current;
        }
      }
      // Handle other values
      else if (current !== original) {
        changedFields[key] = current;
      }
    });

    return changedFields;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!staff || !originalValues) return;
    setIsLoading(true);

    // Only get changed fields
    const changedFields = getChangedFields(values, originalValues);

    if (Object.keys(changedFields).length === 0) {
      setIsEditing(false);
      setIsLoading(false);
      showToast({
        type: "info",
        title: "No Changes",
        message: "No changes detected.",
      });
      return;
    }

    // Format dates for changed fields only
    const payload: any = {};
    Object.keys(changedFields).forEach((key) => {
      if (key === "dob" || key === "joining_date") {
        payload[key] = changedFields[key]
          ? changedFields[key].toISOString().split("T")[0]
          : undefined;
      } else {
        payload[key] = changedFields[key];
      }
    });

    try {
      const response = await staffService.updateStaff(staff.id, payload);
      if (response.success) {
        setStaff(response.data);
        setIsUpdated(true);

        showToast({
          type: "success",
          title: "Updated",
          message: "Staff details updated.",
        });
      } else {
        showToast({
          type: "error",
          title: "Failed",
          message: response.message || "Update failed.",
        });
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Failed",
        message: error.message || "Update failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset(originalValues);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 w-full" />
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!staff) return <div className="p-6">Staff not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = `/staff-management/list`)
            }
            className="flex items-center gap-2 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profiles
          </Button>
        </div>
        <div className="flex items-center">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Staff Profile
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage staff information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="text-gray-600">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
            {isEditing ? (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary */}
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage
                  src={staff.photo_url || undefined}
                  alt={staff.name}
                />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {staff.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {staff.name}
              </h2>
              <p className="text-gray-600 mb-2">Staff ID: {staff.id}</p>
              <p className="text-sm text-gray-500 mb-4">
                Department:{" "}
                {staff.designation || staff.user?.userSchools?.[0]?.role}
              </p>
              {isEditing && (
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="mr-1 h-3 w-3" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="mr-1 h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 h-4 w-4" />
                Quick Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium capitalize">
                    {staff.gender || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${
                      staff.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {staff.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium capitalize">
                    {staff.user?.userSchools?.[0]?.role}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <Form {...form}>
              <form>
                {/* Personal Information */}
                <Card className="p-6 mb-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center text-lg">
                      <User className="mr-2 h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                className={
                                  !isEditing ? "bg-gray-50 border-gray-200" : ""
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="username"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                className="bg-gray-50 border-gray-200"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                              <Mail className="mr-1 h-3 w-3" />
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                className="bg-gray-50 border-gray-200"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="phone"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                              <Phone className="mr-1 h-3 w-3" />
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                value={field.value?.join(", ") || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      .split(",")
                                      .map((p) => p.trim())
                                  )
                                }
                                disabled={!isEditing}
                                className={
                                  !isEditing ? "bg-gray-50 border-gray-200" : ""
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="address"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                className={
                                  !isEditing ? "bg-gray-50 border-gray-200" : ""
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="gender"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Gender
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!isEditing}
                            >
                              <SelectTrigger
                                className={
                                  !isEditing ? "bg-gray-50 border-gray-200" : ""
                                }
                              >
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                {genders.map((g) => (
                                  <SelectItem
                                    key={g}
                                    value={g}
                                    className="capitalize"
                                  >
                                    {g}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="dob"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              Date of Birth
                            </FormLabel>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              disabled={!isEditing}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center text-lg">
                      <Briefcase className="mr-2 h-5 w-5" />
                      Professional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        name="role"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Role
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!isEditing}
                            >
                              <SelectTrigger
                                className={
                                  !isEditing ? "bg-gray-50 border-gray-200" : ""
                                }
                              >
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((r) => (
                                  <SelectItem
                                    key={r}
                                    value={r}
                                    className="capitalize"
                                  >
                                    {r}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="designation"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Designation
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                className={
                                  !isEditing ? "bg-gray-50 border-gray-200" : ""
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="joining_date"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              Joining Date
                            </FormLabel>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              disabled={!isEditing}
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="salary"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                              <DollarSign className="mr-1 h-3 w-3" />
                              Salary
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled={!isEditing}
                                className={
                                  !isEditing ? "bg-gray-50 border-gray-200" : ""
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="qualification"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                              <GraduationCap className="mr-1 h-3 w-3" />
                              Qualification
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                className={
                                  !isEditing ? "bg-gray-50 border-gray-200" : ""
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="notes"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                              <NotesIcon className="mr-1 h-3 w-3" />
                              Notes
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                className={
                                  !isEditing ? "bg-gray-50 border-gray-200" : ""
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(StaffProfilePage, [UserRole.ADMIN]);
