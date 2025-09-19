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
import { Student, StudentRegistrationPayload } from "@/types/student";
import { useEffect, useState } from "react";
import { Class, ClassSection } from "@/services/classService";
import { useAuth } from "@/store/authStore";
import { classService } from "@/services/classService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/DatePicker";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  classId: z.string().nonempty({ message: "Class is required." }),
  sectionId: z.string().nonempty({ message: "Section is required." }),
  name: z.string().nonempty({ message: "Name is required." }),
  gender: z.enum(["male", "female"]),
  dob: z.date(),
  phone: z.string().nonempty({ message: "Phone number is required." }),
  address: z.string().nonempty({ message: "Address is required." }),
  admission_date: z.date(),
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
});

interface EditStudentFormProps {
  student: Student;
  onSuccess: () => void;
}

export const EditStudentForm = ({ student, onSuccess }: EditStudentFormProps) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...student,
      dob: new Date(student.dob),
      admission_date: new Date(student.admission_date),
      classId: student.class.id,
      sectionId: student.section.id,
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
    }
  }, [selectedClassId, classes]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const payload: Partial<StudentRegistrationPayload> = {
      ...values,
      dob: values.dob.toISOString().split("T")[0],
      admission_date: values.admission_date.toISOString().split("T")[0],
    };

    try {
      await studentService.updateStudent(student.id, payload);
      toast.success("Student updated successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to update student.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="dob" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><DatePicker field={field} /><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="admission_date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Admission Date</FormLabel><DatePicker field={field} /><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="classId" render={({ field }) => (<FormItem><FormLabel>Class</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl><SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="sectionId" render={({ field }) => (<FormItem><FormLabel>Section</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedClassId}><FormControl><SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger></FormControl><SelectContent>{sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Changes"}</Button>
      </form>
    </Form>
  );
};
