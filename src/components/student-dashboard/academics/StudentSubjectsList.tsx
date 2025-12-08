"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { subjectService, Subject } from "@/services/subjectService";
import { Loader } from "@/components/ui/Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const StudentSubjectsList = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { student, selectedSchool } = useAuthStore();
  const studentEnrollment = student?.student_enrolled?.[0];

  const fetchSubjects = useCallback(async () => {
    if (!studentEnrollment || !selectedSchool) return;
    try {
      setLoading(true);
      const response = await subjectService.getSubjects({
        schoolId: selectedSchool.schoolId,
        sectionId: studentEnrollment.sectionId,
      });
      if (response.success) {
        setSubjects(response.data.data);
      } else {
        throw new Error(response.message);
      }
      setError(null);
    } catch (error: any) {
      setError(error.message || "Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  }, [studentEnrollment, selectedSchool]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  if (loading) {
    return <Loader size="lg" text="Loading subjects..." />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">My Subjects</h1>
      </div>
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>{subject.name}</TableCell>
                <TableCell>{subject.code}</TableCell>
                <TableCell>{subject?.teacher?.name || "Unassigned"}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      subject.isActive
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-red-100 text-red-800 border-red-300"
                    }
                  >
                    {subject.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {subjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No subjects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudentSubjectsList;
