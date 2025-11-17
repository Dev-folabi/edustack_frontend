"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { getStudentAttendance } from "@/services/attendanceService";
import { AttendanceRecord } from "@/types/attendance";
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
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { student } = useAuthStore();

  const fetchAttendance = useCallback(async () => {
    if (!student) return;
    try {
      setLoading(true);
      const response = await getStudentAttendance({
        sectionId: student.student_enrolled?.[0].sectionId,
        studentId: student.id,
      });
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
  }, [student]);

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
