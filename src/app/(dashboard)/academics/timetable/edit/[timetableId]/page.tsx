"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTimetableStore } from "@/store/timetableStore";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { STAFF_ROLES } from "@/constants/roles";
import {
  TimetableStatus,
  Entry as TimetableEntry,
  Timetable,
} from "@/services/timetableService";
import { subjectService, Subject } from "@/services/subjectService";
import { schoolService, Staff } from "@/services/schoolService";
import EntryFormModal, { EntryFormData } from "@/components/dashboard/timetable/EntryFormModal";
import EntriesList from "@/components/dashboard/timetable/EntriesList";
import { useToast } from "@/components/ui/Toast";
import { Loader } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useClassStore } from "@/store/classStore";

const formSchema = z.object({
  status: z.nativeEnum(TimetableStatus),
});

interface EditTimetablePageProps {
  params: {
    timetableId: string;
  };
}

const EditTimetablePage = ({ params }: EditTimetablePageProps) => {
  const { timetableId } = React.use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { selectedSchool } = useAuthStore();
  const {
    schoolTimetables,
    fetchSchoolTimetables,
    updateTimetable,
    updateEntry,
    createEntry,
    deleteEntry,
    deleteTimetable,
    isLoading,
  } = useTimetableStore();

  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteEntryDialogOpen, setIsDeleteEntryDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimetableEntry | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { classes, fetchClasses } = useClassStore();

  useEffect(() => {
    if (selectedSchool) {
      fetchClasses(selectedSchool.schoolId);
    }
  }, [selectedSchool, fetchClasses]);

  useEffect(() => {
    if (selectedSchool) {
      fetchSchoolTimetables(selectedSchool.schoolId);
      subjectService.getSubjects({ schoolId: selectedSchool.schoolId }).then(res => {
        if (res.success && res.data) setSubjects(res.data.data.data || []);
      });
      schoolService.getStaffBySchool(selectedSchool.schoolId, "teacher", true).then(res => {
        if (res.success && res.data) {
            const teacherStaff = res.data.data.map((item: any) => item.user.staff);
            setTeachers(teacherStaff);
        }
      });
    }
  }, [selectedSchool, fetchSchoolTimetables]);

  useEffect(() => {
    const tt = schoolTimetables.find((t) => t.id === timetableId);
    if (tt) {
      setTimetable(tt);
      setEntries(tt.entries);
      form.reset({ status: tt.status });
    }
  }, [schoolTimetables, timetableId, form]);

  const handleEntrySubmit = async (data: EntryFormData) => {
    if (!timetable) return;

    const { id, ...restOfData } = data;

    const entryData = {
      ...restOfData,
      timetableId: timetable.id,
    };

    let response;
    if (editingEntry) {
      response = await updateEntry(editingEntry.id, entryData);
    } else {
      response = await createEntry(entryData);
    }

    if (response.success) {
      showToast({
        type: "success",
        title: "Success",
        message: response.message || `Entry ${editingEntry ? "updated" : "created"} successfully.`,
      });
      fetchSchoolTimetables(timetable.schoolId); // Refresh data
    } else {
      showToast({
        type: "error",
        title: "Error",
        message: response.message || "Failed to save entry.",
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete || !timetable) return;
    const response = await deleteEntry(entryToDelete.id);
    if (response.success) {
      showToast({
        type: "success",
        title: "Success",
        message: response.message || "Entry deleted successfully.",
      });
      fetchSchoolTimetables(timetable.schoolId); // Refresh data
    } else {
      showToast({
        type: "error",
        title: "Error",
        message: response.message || "Failed to delete entry.",
      });
    }
    setIsDeleteEntryDialogOpen(false);
    setEntryToDelete(null);
  };

  const openDeleteEntryDialog = (entry: TimetableEntry) => {
    setEntryToDelete(entry);
    setIsDeleteEntryDialogOpen(true);
  };

  const handleDeleteTimetable = async () => {
    if (!timetable) return;
    const response = await deleteTimetable(timetable.id);
    if (response.success) {
      showToast({
        type: "success",
        title: "Success",
        message: response.message || "Timetable deleted successfully.",
      });
      router.push("/academics/timetable");
    } else {
      showToast({
        type: "error",
        title: "Error",
        message: response.message || "Failed to delete timetable.",
      });
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSaveChanges = async (values: z.infer<typeof formSchema>) => {
    if (!timetable) return;

    const response = await updateTimetable(timetable.id, {
      ...timetable,
      status: values.status,
    });

    if (response.success) {
      showToast({
        type: "success",
        title: "Success",
        message: response.message || "Timetable updated successfully.",
      });
    } else {
      showToast({
        type: "error",
        title: "Error",
        message: response.message || "Failed to update timetable.",
      });
    }
  };

  const openEditModal = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingEntry(undefined);
    setIsModalOpen(true);
  };

  const subjectMap = subjects.reduce((acc, subject) => ({...acc, [subject.id]: subject.name}), {});
  const teacherMap = teachers.reduce((acc, teacher) => ({...acc, [teacher.id]: teacher.name}), {});

  if (!timetable) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin" /></div>;
  }

  const getClassName = (classId: string) => {
    const classInfo = classes.find((c) => c.id === classId);
    return classInfo?.name || "N/A";
  };
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Timetable</h1>
        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>Delete Timetable</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timetable Details</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="text-sm font-medium">Class</label><p>{getClassName(
                  timetable.classId
                )}</p></div>
            <div><label className="text-sm font-medium">Section</label><p>{timetable.section.name}</p></div>
            <div><label className="text-sm font-medium">Term</label><p>{timetable.term?.name || 'N/A'}</p></div>
            <Form {...form}>
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
            </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Timetable Entries</CardTitle>
          <Button onClick={openAddModal}>Add New Entry</Button>
        </CardHeader>
        <CardContent>
          <EntriesList entries={entries} onEdit={openEditModal} onDelete={openDeleteEntryDialog} subjects={subjectMap} teachers={teacherMap} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={form.handleSubmit(handleSaveChanges)} disabled={isLoading}>
          {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <EntryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleEntrySubmit}
        initialData={editingEntry}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the timetable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTimetable}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteEntryDialogOpen} onOpenChange={setIsDeleteEntryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this timetable entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default withAuth(EditTimetablePage, STAFF_ROLES);
