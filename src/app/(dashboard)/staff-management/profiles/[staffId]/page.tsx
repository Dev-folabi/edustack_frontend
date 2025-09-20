"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { staffService } from "@/services/staffService";
import { Staff, StaffRegistrationPayload } from "@/types/staff";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";

// Icons
import {
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Edit,
  Save,
  X,
} from "lucide-react";

// UI Components
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const roles = ["admin", "teacher", "finance", "librarian"];
const genders = ["male", "female"];

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
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
    salary: z.coerce.number().min(0, { message: "Salary must be a positive number." }),
    joining_date: z.date({ required_error: "Joining date is required." }),
    gender: z.enum(["male", "female"], {
      required_error: "Gender is required.",
    }),
    isActive: z.boolean().default(true),
    qualification: z
      .string()
      .nonempty({ message: "Qualification is required." }),
    notes: z.string().optional(),
    photo: z.any().optional(),
  });

const StaffProfilePage = () => {
  const { staffId } = useParams();
  const router = useRouter();
  const { selectedSchool } = useAuthStore();
  const { showToast } = useToast();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        setStaff(res.data.staff);
        form.reset({
            ...res.data,
            dob: new Date(res.data.staff.dob),
            joining_date: new Date(res.data.staff.joining_date),
        });
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
  }, [selectedSchool?.schoolId, staffId, form, showToast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!staff) return;
    setIsLoading(true);
    const payload: Partial<StaffRegistrationPayload> = {
      ...values,
      dob: values.dob.toISOString().split("T")[0],
      joining_date: values.joining_date.toISOString().split("T")[0],
    };

    try {
      const response = await staffService.updateStaff(staff.id, payload);
      if (response.success) {
        setStaff(response.data);
        setIsEditing(false);
        showToast({
          type: "success",
          title: "Success",
          message: "Staff details updated successfully.",
        });
      } else {
        showToast({
          type: "error",
          title: "Update failed",
          message: response.message || "Failed to update staff details.",
        });
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Update failed",
        message: error.message || "Failed to update staff details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full mt-6" />
      </div>
    );
  }

  if (!staff) {
    return <div className="p-6">Staff not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={staff.photo_url} alt={staff.name} />
              <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{staff.name}</CardTitle>
              <p className="text-gray-500">{staff.designation}</p>
            </div>
          </div>
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={form.handleSubmit(onSubmit)} size="sm">
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={(e) => field.onChange(e.target.value.split(','))} disabled={!isEditing} />
                      </FormControl>
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
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genders.map((g) => (
                            <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={!isEditing}
                      />
                    </FormItem>
                  )}
                />
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="joining_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joining Date</FormLabel>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={!isEditing}
                      />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={!isEditing} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default withAuth(StaffProfilePage, [UserRole.ADMIN, UserRole.TEACHER]);
