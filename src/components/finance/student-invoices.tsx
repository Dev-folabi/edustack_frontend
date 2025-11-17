"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { invoiceService } from "@/services/invoiceService";
import { PageHeader } from "@/components/ui/page-header";
import { Loading } from "@/components/ui/loading";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./invoice-columns";

export const StudentInvoices = () => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const schoolId = searchParams.get("schoolId");

  const { data, isLoading } = useQuery({
    queryKey: ["student-invoices", studentId],
    queryFn: () =>
      invoiceService.getInvoices({
        studentId: studentId!,
        schoolId: schoolId!,
      }),
  });

  return (
    <div>
      <PageHeader title="My Invoices" />
      {isLoading ? (
        <Loading />
      ) : (
        <DataTable columns={columns} data={data?.data || []} />
      )}
    </div>
  );
};
