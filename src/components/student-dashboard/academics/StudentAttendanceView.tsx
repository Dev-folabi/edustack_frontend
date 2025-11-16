"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { attendanceService } from "@/services/attendanceService";
import { StudentAttendance } from "@/types/attendance";
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

const StudentAttendanceView = () => {
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, selectedSchool } = useAuthStore();
  const studentId = user?.student?.id;

  const fetchAttendance = useCallback(async () => {
    if (!studentId || !selectedSchool) return;
    try {
      setLoading(true);
      const response = await attendanceService.getStudentAttendance(
        selectedSchool.schoolId,
        studentId
      );
      if (response.success) {
        setAttendance(response.data.data);
      } else {
        throw new Error(response.message);
      }
      setError(null);
    } catch (error: any) {
      setError(error.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  }, [studentId, selectedSchool]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  if (loading) {
    return <Loader size="lg" text="Loading attendance..." />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
      </div>
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {new Date(record.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      record.status === "PRESENT" ? "default" : "destructive"
                    }
                  >
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell>{record.remarks || "-"}</TableCell>
              </TableRow>
            ))}
            {attendance.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No attendance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudentAttendanceView;
