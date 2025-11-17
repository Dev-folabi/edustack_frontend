"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { subjectService } from "@/services/subjectService";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "../academics/columns";
import { PageHeader } from "@/components/ui/page-header";
import { Loading } from "@/components/ui/loading";

export const StudentSubjects = () => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const schoolId = searchParams.get("schoolId");
  const classId = searchParams.get("classId");
  const sectionId = searchParams.get("sectionId");

  const { data, isLoading } = useQuery({
    queryKey: ["student-subjects", studentId],
    queryFn: () =>
      subjectService.getSubjects({
        schoolId: schoolId!,
        classId: classId!,
        sectionId: sectionId!,
      }),
  });

  return (
    <div>
      <PageHeader title="My Subjects" />
      {isLoading ? (
        <Loading />
      ) : (
        <DataTable columns={columns} data={data?.data || []} />
      )}
    </div>
  );
};
