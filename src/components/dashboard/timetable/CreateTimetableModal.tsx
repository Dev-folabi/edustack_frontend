"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/authStore";
import { useSessionStore } from "@/store/sessionStore";
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
  TimetableStatus,
  CreateTimetableData,
} from "@/services/timetableService";

const formSchema = z.object({
  name: z.string().min(1, "Timetable name is required"),
  sessionId: z.string().min(1, "Session is required"),
  termId: z.string().optional(),
  status: z.nativeEnum(TimetableStatus).default(TimetableStatus.DRAFT),
});

interface CreateTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTimetableData) => Promise<void>;
  classId: string;
  sectionId: string;
}

const CreateTimetableModal = ({
  isOpen,
  onClose,
  onSubmit,
  classId,
  sectionId,
}: CreateTimetableModalProps) => {
  const { selectedSchool } = useAuthStore();
  const { sessions, fetchSessions } = useSessionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sessionId: "",
      termId: "",
      status: TimetableStatus.DRAFT,
    },
  });

  useEffect(() => {
    if (selectedSchool && isOpen) {
      fetchSessions();
    }
  }, [selectedSchool, isOpen, fetchSessions]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedSchool) return;

    setIsSubmitting(true);
    try {
      const data: CreateTimetableData = {
        ...values,
        schoolId: selectedSchool.schoolId,
        classId,
        sectionId,
        entries: [], // Start with empty entries
      };
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Failed to create timetable:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Timetable</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timetable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter timetable name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Session</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.name}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Timetable"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTimetableModal;