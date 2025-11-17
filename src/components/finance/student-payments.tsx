"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { paymentService } from "@/services/paymentService";
import { PageHeader } from "@/components/ui/page-header";
import { Loading } from "@/components/ui/loading";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "../finance/columns";

export const StudentPayments = () => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const schoolId = searchParams.get("schoolId");

  const { data, isLoading } = useQuery({
    queryKey: ["student-payments", studentId],
    queryFn: () =>
      paymentService.getPayments({
        studentId: studentId!,
        schoolId: schoolId!,
      }),
  });

  return (
    <div>
      <PageHeader title="My Payments" />
      {isLoading ? (
        <Loading />
      ) : (
        <DataTable columns={columns} data={data?.data || []} />
      )}
    </div>
  );
};
