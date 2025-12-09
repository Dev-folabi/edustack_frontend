"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSessionStore } from "@/store/sessionStore";
import { useClassStore } from "@/store/classStore";
import { useTimetableStore } from "@/store/timetableStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { STAFF_ROLES } from "@/constants/roles";
import {
  TimetableStatus,
  Entry as TimetableEntry,
} from "@/services/timetableService";
import { subjectService, Subject } from "@/services/subjectService";
import { schoolService, Staff } from "@/services/schoolService";
import { Term } from "@/services/sessionService";
import EntryFormModal, {
  EntryFormData,
} from "@/components/dashboard/timetable/EntryFormModal";
import EntriesList from "@/components/dashboard/timetable/EntriesList";
import { useToast } from "@/components/ui/Toast";
import { Loader } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  classId: z.string().min(1, "Class is required"),
  sectionId: z.string().min(1, "Section is required"),
  termId: z.string().min(1, "Term is required"),
  status: z.nativeEnum(TimetableStatus),
});

const CreateTimetablePage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { selectedSchool } = useAuthStore();
  const { selectedSession, fetchSessions } = useSessionStore();
  const { classes, fetchClasses } = useClassStore();
  const { createTimetable, isLoading } = useTimetableStore();

  const [terms, setTerms] = useState<Term[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | undefined>(
    undefined
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      status: TimetableStatus.DRAFT,
    },
  });

  useEffect(() => {
    if (selectedSchool?.schoolId) {
      fetchSessions(selectedSchool.schoolId);
      fetchClasses(selectedSchool.schoolId);
      subjectService
        .getSubjects({ schoolId: selectedSchool.schoolId })
        .then((res) => {
          if (res.success) setSubjects(res.data?.data.data || []);
        });
      schoolService
        .getStaffBySchool(selectedSchool.schoolId, "teacher", true)
        .then((res) => {
          if (res.success) setTeachers(res.data?.data.data || []);
        });
    }
  }, [selectedSchool, fetchSessions, fetchClasses]);

  useEffect(() => {
    if (selectedSession) {
      // Set terms from the selected session
      setTerms(selectedSession.terms || []);
    }
  }, [selectedSession]);

  const convertTimeToISO = (timeString: string): string => {
    // If it's already an ISO string, return it as-is
    if (timeString.includes("T") || timeString.includes("Z")) {
      return timeString;
    }

    // Use a fixed base date to avoid timezone conversion issues
    const baseDate = "1970-01-01";
    // Ensure time string has seconds (HH:mm:ss format)
    const timeWithSeconds =
      timeString.includes(":") && timeString.split(":").length === 2
        ? `${timeString}:00`
        : timeString;

    // Validate the date before converting
    const date = new Date(`${baseDate}T${timeWithSeconds}`);
    if (isNaN(date.getTime())) {
      console.error("Invalid time string:", timeString);
      return new Date(`${baseDate}T00:00:00`).toISOString(); // Return a default valid time
    }

    return date.toISOString();
  };

  const handleAddEntry = (data: EntryFormData) => {
    const newEntry: TimetableEntry = {
      ...data,
      id: `temp-${Date.now()}`, // Temporary ID for list key
      startTime: convertTimeToISO(data.startTime),
      endTime: convertTimeToISO(data.endTime),
      timetableId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEntries([...entries, newEntry]);
  };

  const handleEditEntry = (data: EntryFormData) => {
    setEntries(
      entries.map((entry) =>
        entry.id === editingEntry?.id
          ? {
              ...entry,
              ...data,
              startTime: convertTimeToISO(data.startTime),
              endTime: convertTimeToISO(data.endTime),
            }
          : entry
      )
    );
  };

  const handleDeleteEntry = (entryToDelete: TimetableEntry) => {
    setEntries(entries.filter((entry) => entry.id !== entryToDelete.id));
  };

  const openEditModal = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingEntry(undefined);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedSchool?.schoolId || !selectedSession) return;
    const schoolId = selectedSchool.schoolId;

    if (entries.length === 0) {
      showToast({
        type: "error",
        title: "No Entries",
        message: "Please add at least one entry to the timetable.",
      });
      return;
    }

    const timetableData = {
      ...values,
      schoolId,
      name: values.name,
      sessionId: selectedSession.id,
      entries: entries.map(({ id: _id, ...entry }) => {
        // Remove temporary ID and filter out empty subjectId and teacherId
        const cleanedEntry: Omit<
          TimetableEntry,
          "id" | "timetableId" | "subject" | "teacher"
        > = { ...(entry as TimetableEntry) };
        if (!cleanedEntry.subjectId || cleanedEntry.subjectId === "") {
          delete (cleanedEntry as any).subjectId;
        }
        if (!cleanedEntry.teacherId || cleanedEntry.teacherId === "") {
          delete (cleanedEntry as any).teacherId;
        }
        delete (cleanedEntry as any).createdAt;
        delete (cleanedEntry as any).updatedAt;
        delete (cleanedEntry as any).timetableId;
        return cleanedEntry;
      }),
    };

    const result = await createTimetable(timetableData);
    if (result) {
      showToast({
        type: "success",
        title: "Success",
        message: "Timetable created successfully.",
      });
      router.push("/academics/timetable");
    } else {
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to create timetable.",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Create New Timetable</h1>

      <Card>
        <CardHeader>
          <CardTitle>Timetable Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Timetable name" {...field} />
                      </FormControl>
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
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
                        defaultValue={field.value}
                        disabled={!form.watch("classId")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes
                            .find((c) => c.id === form.watch("classId"))
                            ?.sections.map((section) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name}
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
                  name="termId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {terms.map((term) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.name}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(TimetableStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Timetable Entries</CardTitle>
          <Button onClick={openAddModal}>Add New Entry</Button>
        </CardHeader>
        <CardContent>
          <EntriesList
            entries={entries}
            onEdit={openEditModal}
            onDelete={handleDeleteEntry}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(handleSubmit)} disabled={isLoading}>
          {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Create Timetable
        </Button>
      </div>

      <EntryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingEntry ? handleEditEntry : handleAddEntry}
        initialData={editingEntry}
        sectionId={form.watch("sectionId")}
      />
    </div>
  );
};

export default withAuth(CreateTimetablePage, STAFF_ROLES);
