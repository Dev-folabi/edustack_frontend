"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  WeekDay,
  PeriodType,
  Entry as TimetableEntry,
} from "@/services/timetableService";
import { subjectService, Subject } from "@/services/subjectService";
import { schoolService, Staff } from "@/services/schoolService";

const formSchema = z.object({
  day: z.array(z.enum(WeekDay)).min(1, "At least one day must be selected."),
  startTime: z.string().nonempty("Start time is required."),
  endTime: z.string().nonempty("End time is required."),
  type: z.nativeEnum(PeriodType).default(PeriodType.REGULAR),
  subjectId: z.string().optional().or(z.literal("")),
  teacherId: z.string().optional().or(z.literal("")),
});

export type EntryFormData = z.infer<typeof formSchema> & { id?: string };

interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EntryFormData) => void;
  initialData?: Partial<TimetableEntry>;
  sectionId?: string;
}

const EntryFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  sectionId,
}: EntryFormModalProps) => {
  const { selectedSchool } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const isEditing = !!initialData;

  const form = useForm<EntryFormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      day: [],
      startTime: "",
      endTime: "",
      type: PeriodType.REGULAR,
      subjectId: "",
      teacherId: "",
    },
  });

  // Helper function to safely extract time from ISO string
  const extractTimeFromISO = (isoString: string | undefined): string => {
    if (!isoString) return "";

    try {
      const date = new Date(isoString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date string:", isoString);
        return "";
      }
      // Extract time in HH:mm format
      return date.toTimeString().slice(0, 5);
    } catch (error) {
      console.error("Error parsing date:", error);
      return "";
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        startTime: extractTimeFromISO(initialData.startTime),
        endTime: extractTimeFromISO(initialData.endTime),
      });
    } else {
      form.reset({
        day: [],
        startTime: "",
        endTime: "",
        type: PeriodType.REGULAR,
        subjectId: "",
        teacherId: "",
      });
    }
  }, [initialData, form]);

  useEffect(() => {
    const loadData = async () => {
      if (selectedSchool?.schoolId) {
        try {
          const subjectFilters: { schoolId: string; sectionId?: string } = {
            schoolId: selectedSchool.schoolId,
          };

          // Add sectionId to filters if it's provided
          if (sectionId) {
            subjectFilters.sectionId = sectionId;
          }

          const [subjectsRes, teachersRes] = await Promise.all([
            subjectService.getSubjects(subjectFilters),
            schoolService.getStaffBySchool(
              selectedSchool.schoolId,
              "teacher",
              true
            ),
          ]);
          if (subjectsRes.success && subjectsRes.data) {
            setSubjects(subjectsRes.data.data);
          }
          if (
            teachersRes.success &&
            teachersRes.data &&
            Array.isArray(teachersRes.data.data)
          ) {
            const teacherStaff = teachersRes.data.data.map(
              (item: { user: { staff: Staff } }) => item.user.staff
            );
            setTeachers(teacherStaff);
          }
        } catch (error) {
          console.error("Failed to load subjects or teachers", error);
        }
      }
    };
    if (isOpen) {
      loadData();
    }
  }, [selectedSchool, isOpen, sectionId]);

  const handleFormSubmit = (values: EntryFormData) => {
    // Validate time strings
    if (!values.startTime || !values.endTime) {
      console.error("Start time and end time are required");
      return;
    }

    const baseDate = "1970-01-01";
    // Ensure time strings have seconds (HH:mm:ss format)
    const startTimeWithSeconds =
      values.startTime.includes(":") && values.startTime.split(":").length === 2
        ? `${values.startTime}:00`
        : values.startTime;
    const endTimeWithSeconds =
      values.endTime.includes(":") && values.endTime.split(":").length === 2
        ? `${values.endTime}:00`
        : values.endTime;

    // Validate the constructed date strings
    const startDate = new Date(`${baseDate}T${startTimeWithSeconds}`);
    const endDate = new Date(`${baseDate}T${endTimeWithSeconds}`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error("Invalid time format");
      return;
    }

    const updatedValues = {
      ...values,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      // Convert "none" to empty string for optional fields
      subjectId: values.subjectId === "none" ? "" : values.subjectId,
      teacherId: values.teacherId === "none" ? "" : values.teacherId,
      ...(isEditing && initialData?.id && { id: initialData.id }),
    };
    onSubmit(updatedValues);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Entry" : "Add New Entry"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="day"
              render={() => (
                <FormItem>
                  <FormLabel>Days of the Week</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    {Object.values(WeekDay).map((day) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name="day"
                        render={({ field }) => (
                          <FormItem
                            key={day}
                            className="flex items-center gap-2 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        day,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== day
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {day.charAt(0) + day.slice(1).toLowerCase()}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PeriodType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0) +
                            type.slice(1).toLowerCase().replace(/_/g, " ")}
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
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue=""
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue=""
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {teachers?.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Entry" : "Add Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EntryFormModal;
