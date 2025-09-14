"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/ui/Loader";
import { Loader2 } from "lucide-react";
import { subjectService, Subject, Teacher } from "@/services/subjectService";

import { classService } from "@/services/classService";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/constants/roles";
import { PlusCircle, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { staffService } from "@/services/staffService";

const SubjectsList = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] =
    useState(false);
  const [isAssigningTeacher, setIsAssigningTeacher] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const { selectedSchool } = useAuthStore();
  const userRole = selectedSchool?.role;
  const canManage =
    userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;

  const fetchSections = useCallback(async () => {
    if (!selectedSchool) return;
    try {
      const response = await classService.getClasses(selectedSchool.schoolId);
      if (response.success) {
        const allSections = response.data.data.flatMap((c: any) =>
          c.sections.map((s: any) => ({
            value: s.id,
            label: `${c.name} - ${s.name}`,
          }))
        );
        setSections(allSections);
      }
    } catch (error) {
      console.error("Failed to fetch sections for filter");
    }
  }, [selectedSchool]);

  const fetchSubjects = useCallback(async () => {
    if (!selectedSchool) return;
    try {
      setLoading(true);
      const filters: any = { schoolId: selectedSchool.schoolId };
      // Remove server-side section filtering to handle it client-side

      const response = await subjectService.getSubjects(filters);
      if (response.success) {
        setSubjects(response.data.data);
      } else {
        throw new Error(response.message);
      }
      setError(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch subjects");
      setError("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  }, [selectedSchool]); // Remove sectionFilter dependency

  const fetchTeachers = useCallback(async () => {
    if (!selectedSchool) return;
    try {
      const response = await staffService.getStaffBySchool(
        selectedSchool.schoolId,
        { role: "teacher", isActive: true }
      );
      if (response.success) {
        const teacherList = response.data.data
          .filter((staff: any) => staff.role === "teacher")
          .map((staff: any) => ({
            id: staff.user.staff.id,
            name: staff.user.staff.name,
          }));
        setTeachers(teacherList);
      }
    } catch (error) {
      toast.error("Failed to fetch teachers");
    }
  }, [selectedSchool]);

  useEffect(() => {
    fetchSections();
    fetchSubjects();
    if (canManage) {
      fetchTeachers();
    }
  }, [fetchSections, fetchSubjects, fetchTeachers, canManage]);

  const handleAssignTeacher = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedTeacher("");
    setIsAssignTeacherDialogOpen(true);
  };

  const handleConfirmAssignTeacher = async () => {
    if (!selectedSubject || !selectedTeacher) {
      toast.error("Please select a teacher.");
      return;
    }
    try {
      setIsAssigningTeacher(true);
      await subjectService.assignTeacher(selectedSubject.id, selectedTeacher);
      toast.success("Teacher assigned successfully");
      setIsAssignTeacherDialogOpen(false);
      fetchSubjects();
    } catch (error) {
      toast.error("Failed to assign teacher");
    } finally {
      setIsAssigningTeacher(false);
    }
  };

  const handleDelete = (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;

    try {
      setDeletingSubjectId(subjectToDelete.id);
      await subjectService.deleteSubject(subjectToDelete.id);
      toast.success("Subject deleted successfully");
      fetchSubjects();
      setIsDeleteDialogOpen(false);
      setSubjectToDelete(null);
    } catch (error) {
      toast.error("Failed to delete subject");
    } finally {
      setDeletingSubjectId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setSubjectToDelete(null);
    setDeletingSubjectId(null);
  };

  const filteredSubjects = subjects.filter((subject) => {
    // Fix the filtering logic
    if (!sectionFilter || sectionFilter === "all" || sectionFilter === "") {
      return true; // Show all subjects
    }

    // Check if subject has sections and if any section matches the filter
    if (subject.sections && subject.sections.length > 0) {
      return subject.sections.some((s: any) => s.section?.id === sectionFilter);
    }

    // Fallback: check sectionIds if available
    if (subject.sectionIds && subject.sectionIds.length > 0) {
      return subject.sectionIds.includes(sectionFilter);
    }

    return false;
  });

  const getSectionNames = (subject: any) => {
    if (!subject.sections || subject.sections.length === 0)
      return "No sections";
    return subject.sections
      .map((s: any) => s.section?.name || "Unknown")
      .join(", ");
  };

  const getClassNames = (subject: any) => {
    if (!subject.sections || subject.sections.length === 0) return "No classes";
    const classNames = [
      ...new Set(
        subject.sections.map((s: any) => s.section?.classes?.name || "Unknown")
      ),
    ];
    return classNames.join(", ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" text="Loading subjects..." />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
        {canManage && (
          <Button
            onClick={() => router.push("/academics/subjects/create")}
            className="inline-flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Add Subject
          </Button>
        )}
      </div>

      {/* Filters - Only Section Filter */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex gap-2">
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sections</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section.value} value={section.value}>
                  {section.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sectionFilter && sectionFilter !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSectionFilter("all")}
              className="px-2"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-100">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sections
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                {canManage && (
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {filteredSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subject.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.code}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs">{getClassNames(subject)}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs">{getSectionNames(subject)}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.teacher?.name || "Unassigned"}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge
                      variant={subject.isActive ? "default" : "secondary"}
                      className={
                        subject.isActive
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }
                    >
                      {subject.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={() =>
                            router.push(
                              `/academics/subjects/edit/${subject.id}`
                            )
                          }
                          className="flex items-center gap-1 text-gray-500 transition-colors hover:text-blue-600"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleAssignTeacher(subject)}
                          className="flex items-center gap-1 text-gray-500 transition-colors hover:text-blue-600"
                        >
                          <UserPlus size={16} />
                          Assign Teacher
                        </button>
                        <button
                          onClick={() => handleDelete(subject)}
                          className="flex items-center gap-1 text-red-500 transition-colors hover:text-red-700"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredSubjects.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 7 : 6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {sectionFilter
                      ? "No subjects found matching your filters."
                      : "No subjects found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {canManage && (
        <>
          <Dialog
            open={isAssignTeacherDialogOpen}
            onOpenChange={setIsAssignTeacherDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  Assign Teacher to {selectedSubject?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Select
                  value={selectedTeacher}
                  onValueChange={setSelectedTeacher}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.length === 0 ? (
                      <SelectItem
                        key="no-teachers"
                        value="no-teachers"
                        disabled
                      >
                        No teachers available
                      </SelectItem>
                    ) : (
                      teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {teachers.length === 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    No teachers found. Please ensure teachers are registered in
                    the system.
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAssignTeacherDialogOpen(false)}
                  disabled={isAssigningTeacher}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAssignTeacher}
                  disabled={
                    !selectedTeacher ||
                    selectedTeacher === "no-teachers" ||
                    isAssigningTeacher
                  }
                >
                  {isAssigningTeacher ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Subject</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete the subject{" "}
                  <strong>"{subjectToDelete?.name}"</strong>? This action cannot
                  be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={deletingSubjectId === subjectToDelete?.id}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deletingSubjectId === subjectToDelete?.id}
                >
                  {deletingSubjectId === subjectToDelete?.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default SubjectsList;
