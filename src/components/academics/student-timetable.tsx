"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { timetableService } from "@/services/timetableService";
import { PageHeader } from "@/components/ui/page-header";
import { Loading } from "@/components/ui/loading";
import { Timetable } from "@/components/academics/timetable";

export const StudentTimetable = () => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const schoolId = searchParams.get("schoolId");
  const classId = searchParams.get("classId");
  const sectionId = searchParams.get("sectionId");

  const { data, isLoading } = useQuery({
    queryKey: ["student-timetable", studentId],
    queryFn: () =>
      timetableService.getTimetable({
        schoolId: schoolId!,
        classId: classId!,
        sectionId: sectionId!,
      }),
  });

  return (
    <div>
      <PageHeader title="My Timetable" />
      {isLoading ? (
        <Loading />
      ) : (
        <Timetable timetable={data?.data} />
      )}
    </div>
  );
};
