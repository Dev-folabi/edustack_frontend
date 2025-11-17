"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { attendanceService } from "@/services/attendanceService";
import { PageHeader } from "@/components/ui/page-header";
import { Loading } from "@/components/ui/loading";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export const StudentAttendance = () => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const schoolId = searchParams.get("schoolId");
  const classId = searchParams.get("classId");
  const sectionId = searchParams.get("sectionId");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data, isLoading } = useQuery({
    queryKey: ["student-attendance", studentId, date],
    queryFn: () =>
      attendanceService.getStudentAttendance({
        studentId: studentId!,
        schoolId: schoolId!,
        classId: classId!,
        sectionId: sectionId!,
        date: date!.toISOString(),
      }),
  });

  return (
    <div>
      <PageHeader title="My Attendance" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Attendance for {date?.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loading />
              ) : (
                <div>
                  {data?.data.map((attendance: any) => (
                    <div
                      key={attendance.id}
                      className="flex items-center justify-between"
                    >
                      <p>{attendance.subject.name}</p>
                      <p
                        className={`px-2 py-1 rounded-full text-white ${
                          attendance.status === "PRESENT"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {attendance.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
