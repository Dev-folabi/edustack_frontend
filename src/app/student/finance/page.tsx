// src/app/student/finance/page.tsx
"use client";

import { useEffect, useState } from "react";
import { financeService } from "@/services/financeService";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";
import { DataTable } from "@/components/finance/DataTable";
import { Button } from "@/components/ui/button";
import { StudentFinancialReport, Invoice } from "@/services/financeService";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

const StudentFinancePage = () => {
  const [report, setReport] = useState<StudentFinancialReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedSchool = useAuthStore((state) => state.selectedSchool);
  const student = useAuthStore((state) => state.student);

  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedSchool || !student) return;

      try {
        const response = await financeService.getStudentFinancialReport(
          student.id,
          selectedSchool.schoolId
        );
        if (response.success) {
          setReport(response.data);
        } else {
          setError(response.message || "Failed to fetch financial report.");
        }
      } catch (err) {
        setError("An error occurred while fetching the financial report.");
      }
    };

    fetchReport();
  }, [selectedSchool, student]);

  const outstandingBalance =
    report?.invoices.reduce((acc, invoice) => acc + invoice.balance, 0) || 0;

  // Define columns for the DataTable
  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
    },
    {
      accessorKey: "balance",
      header: "Balance",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  return (
    <div>
      <h1>Student Finance Dashboard</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>Outstanding Balance: ${outstandingBalance.toFixed(2)}</h2>
        <Link href="/student/finance/make-payment">
          <Button>Make a Payment</Button>
        </Link>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h2>Recent Transactions</h2>
      <DataTable columns={columns} data={report?.invoices || []} />
    </div>
  );
};

export default withAuth(StudentFinancePage, [
  UserRole.STUDENT,
  UserRole.PARENT,
]);
