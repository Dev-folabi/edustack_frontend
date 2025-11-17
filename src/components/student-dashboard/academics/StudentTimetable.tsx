"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { Timetable, timetableService } from "@/services/timetableService";
import { Loader } from "@/components/ui/Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { student, selectedSchool } = useAuthStore();
  const studentEnrollment = student?.student_enrolled?.[0];

  const fetchTimetable = useCallback(async () => {
    if (!studentEnrollment || !selectedSchool) return;
    try {
      setLoading(true);
      const response = await timetableService.getClassTimetable(
        studentEnrollment.sectionId
      );
      if (response.success) {
        setTimetable(response?.data?.data);
      } else {
        throw new Error(response.message);
      }
      setError(null);
    } catch (error: any) {
      setError(error.message || "Failed to fetch timetable");
    } finally {
      setLoading(false);
    }
  }, [studentEnrollment, selectedSchool]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  if (loading) {
    return <Loader size="lg" text="Loading timetable..." />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">My Timetable</h1>
      </div>
      <div className="p-6">
        {timetable ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                {timetable.periods.map((period) => (
                  <TableHead key={period.id}>
                    {period.startTime} - {period.endTime}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {timetable.days.map((day) => (
                <TableRow key={day.id}>
                  <TableCell>{day.day}</TableCell>
                  {timetable.periods.map((period) => {
                    const entry = timetable.entries.find(
                      (e) => e.dayId === day.id && e.periodId === period.id
                    );
                    return (
                      <TableCell key={period.id}>
                        {entry ? entry.subject.name : "-"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No timetable found.</p>
        )}
      </div>
    </div>
  );
};

export default StudentTimetable;
