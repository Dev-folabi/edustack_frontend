// src/app/(dashboard)/finance/payments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { financeService } from "@/services/financeService";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";
import { DataTable } from "@/components/finance/DataTable";
import { Button } from "@/components/ui/button";
import { Payment } from "@/services/financeService";
import { ColumnDef } from "@tanstack/react-table";

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const selectedSchool = useAuthStore((state) => state.selectedSchool);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!selectedSchool) return;

      try {
        const response = await financeService.getPayments();
        if (response.success) {
          setPayments(response.data.data);
        } else {
          setError(response.message || "Failed to fetch payments.");
        }
      } catch (err) {
        setError("An error occurred while fetching the payments.");
      }
    };

    fetchPayments();
  }, [selectedSchool]);

  // Define columns for the DataTable
  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "invoiceId",
      header: "Invoice ID",
    },
    {
      accessorKey: "studentId",
      header: "Student ID",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div>
          <Button variant="outline" size="sm" onClick={() => handleView(row.original)}>
            View Details
          </Button>
        </div>
      ),
    },
  ];

  const handleView = (payment: Payment) => {
    // Handle view logic
    console.log("Viewing:", payment);
  };

  return (
    <div>
      <h1>Payment Management</h1>
      <div style={{ marginBottom: "20px" }}>
        <Button>Record New Payment</Button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <DataTable columns={columns} data={payments} />
    </div>
  );
};

export default withAuth(PaymentsPage, [UserRole.ADMIN, UserRole.FINANCE]);
