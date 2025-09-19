"use client";

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
import { toast } from "sonner";
import { studentService } from "@/services/studentService";
import { StudentRegistrationPayload } from "@/types/student";
import { useEffect, useState } from "react";
import { Class, ClassSection } from "@/services/classService";
import { useAuth } from "@/store/authStore";
import { classService } from "@/services/classService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/DatePicker";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  classId: z.string().nonempty({ message: "Class is required." }),
  sectionId: z.string().nonempty({ message: "Section is required." }),
  name: z.string().nonempty({ message: "Name is required." }),
  gender: z.enum(["male", "female"], { required_error: "Gender is required." }),
  dob: z.date({ required_error: "Date of birth is required." }),
  phone: z.string().nonempty({ message: "Phone number is required." }),
  address: z.string().nonempty({ message: "Address is required." }),
  admission_date: z.date({ required_error: "Admission date is required." }),
  religion: z.string().nonempty({ message: "Religion is required." }),
  blood_group: z.string().optional(),
  father_name: z.string().nonempty({ message: "Father's name is required." }),
  mother_name: z.string().nonempty({ message: "Mother's name is required." }),
  father_occupation: z.string().nonempty({ message: "Father's occupation is required." }),
  mother_occupation: z.string().nonempty({ message: "Mother's occupation is required." }),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal('')),
  exist_guardian: z.boolean().default(false),
  guardian_name: z.string().optional(),
  guardian_phone: z.array(z.string()).optional(),
  guardian_email: z.string().email().optional().or(z.literal('')),
  guardian_username: z.string().optional(),
  guardian_password: z.string().optional(),
});

export const AdmissionForm = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    },
  });

  const selectedClassId = form.watch("classId");

  useEffect(() => {
    if (user?.schoolId) {
      classService.getClasses(user.schoolId).then((res) => {
        if (res.data) {
          setClasses(res.data.data);
        }
      });
    }
  }, [user?.schoolId]);

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
    if (!user?.schoolId) {
      toast.error("School not selected. Please select a school.");
      return;
    }

    setIsLoading(true);
    const payload: StudentRegistrationPayload = {
      ...values,
      schoolId: user.schoolId,
      dob: values.dob.toISOString().split("T")[0],
      admission_date: values.admission_date.toISOString().split("T")[0],
      guardian_phone: values.guardian_phone ? values.guardian_phone : undefined,
    };

    try {
      await studentService.registerStudent(user.schoolId, payload);
      toast.success("Student registered successfully!");
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to register student.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="Email" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="Username" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="Password" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="Phone Number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="dob" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><DatePicker field={field} /><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="religion" render={({ field }) => (<FormItem><FormLabel>Religion</FormLabel><FormControl><Input placeholder="Religion" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="blood_group" render={({ field }) => (<FormItem><FormLabel>Blood Group</FormLabel><FormControl><Input placeholder="Blood Group" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Address" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="Country" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="photo_url" render={({ field }) => (<FormItem><FormLabel>Photo URL</FormLabel><FormControl><Input placeholder="http://example.com/photo.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Academic Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="admission_date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Admission Date</FormLabel><DatePicker field={field} /><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="classId" render={({ field }) => (<FormItem><FormLabel>Class</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl><SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="sectionId" render={({ field }) => (<FormItem><FormLabel>Section</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedClassId}><FormControl><SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger></FormControl><SelectContent>{sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Parent Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="father_name" render={({ field }) => (<FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input placeholder="Father's Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="father_occupation" render={({ field }) => (<FormItem><FormLabel>Father's Occupation</FormLabel><FormControl><Input placeholder="Father's Occupation" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="mother_name" render={({ field }) => (<FormItem><FormLabel>Mother's Name</FormLabel><FormControl><Input placeholder="Mother's Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="mother_occupation" render={({ field }) => (<FormItem><FormLabel>Mother's Occupation</FormLabel><FormControl><Input placeholder="Mother's Occupation" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Guardian Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="exist_guardian" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel className="text-base">Use different guardian?</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
            {form.watch("exist_guardian") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <FormField control={form.control} name="guardian_name" render={({ field }) => (<FormItem><FormLabel>Guardian's Name</FormLabel><FormControl><Input placeholder="Guardian's Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="guardian_email" render={({ field }) => (<FormItem><FormLabel>Guardian's Email</FormLabel><FormControl><Input type="email" placeholder="Guardian's Email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="guardian_username" render={({ field }) => (<FormItem><FormLabel>Guardian's Username</FormLabel><FormControl><Input placeholder="Guardian's Username" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="guardian_password" render={({ field }) => (<FormItem><FormLabel>Guardian's Password</FormLabel><FormControl><Input type="password" placeholder="Guardian's Password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="guardian_phone" render={({ field }) => (<FormItem><FormLabel>Guardian's Phone</FormLabel><FormControl><Input placeholder="Guardian's Phone (comma-separated)" {...field} onChange={e => field.onChange(e.target.value.split(','))} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading}>{isLoading ? "Submitting..." : "Register Student"}</Button>
      </form>
    </Form>
  );
};
