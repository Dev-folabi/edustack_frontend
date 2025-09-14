"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTimetableStore } from "@/store/timetableStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  WeekDay,
  PeriodType,
  type CreateEntryData,
  type UpdateEntryData,
} from "@/services/timetableService";
import { subjectService } from "@/services/subjectService";
import { schoolService, type Staff } from "@/services/schoolService";
import { Subject } from "@/services/subjectService";

const formSchema = z.object({
  day: z.nativeEnum(WeekDay),
  startTime: z.string().nonempty("Start time is required."),
  endTime: z.string().nonempty("End time is required."),
  type: z.nativeEnum(PeriodType),
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
});

const CreateEditEntryModal = () => {
  const {
    isModalOpen,
    closeModal,
    editingEntry,
    createEntry,
    updateEntry,
    selectedTimetable,
  } = useTimetableStore();
  const { selectedSchool } = useAuthStore();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day: WeekDay.MONDAY,
      startTime: "",
      endTime: "",
      type: PeriodType.REGULAR,
      subjectId: "",
      teacherId: "",
    },
  });

  useEffect(() => {
    if (editingEntry) {
      form.reset({
        day: editingEntry.day[0],
        startTime: new Date(editingEntry.startTime).toTimeString().slice(0, 5),
        endTime: new Date(editingEntry.endTime).toTimeString().slice(0, 5),
        type: editingEntry.type,
        subjectId: editingEntry.subjectId,
        teacherId: editingEntry.teacherId,
      });
    } else {
      form.reset();
    }
  }, [editingEntry, form]);

  useEffect(() => {
    const loadData = async () => {
      if (selectedSchool) {
        try {
          const [subjectsRes, teachersRes] = await Promise.all([
            subjectService.getSubjects(selectedSchool.schoolId),
            schoolService.getStaffBySchool(selectedSchool.schoolId, "teacher"),
          ]);
          if (subjectsRes.success && subjectsRes.data) {
            setSubjects(subjectsRes.data.data.data);
          }
          if (teachersRes.success && teachersRes.data) {
            setTeachers(teachersRes.data.data);
          }
        } catch (error) {
          console.error("Failed to load subjects or teachers", error);
        }
      }
    };
    loadData();
  }, [selectedSchool]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedTimetable) return;

    const [startHour, startMinute] = values.startTime.split(":");
    const startTime = new Date();
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    const [endHour, endMinute] = values.endTime.split(":");
    const endTime = new Date();
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    const data: CreateEntryData | UpdateEntryData = {
      ...values,
      day: [values.day],
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      timetableId: selectedTimetable.id,
    };

    if (editingEntry) {
      updateEntry(editingEntry.id, data);
    } else {
      createEntry(data as CreateEntryData);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? "Edit Timetable Entry" : "Create Timetable Entry"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(WeekDay).map((day) => (
                          <SelectItem key={day} value={day}>
                            {day.charAt(0) + day.slice(1).toLowerCase()}
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PeriodType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
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
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {editingEntry ? "Update Entry" : "Create Entry"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditEntryModal;
