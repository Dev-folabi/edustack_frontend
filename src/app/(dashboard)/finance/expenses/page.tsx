// src/app/(dashboard)/finance/expenses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { financeService } from "@/services/financeService";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";
import { DataTable } from "@/components/finance/DataTable";
import { Button } from "@/components/ui/button";
import { Expense } from "@/services/financeService";
import { ColumnDef } from "@tanstack/react-table";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const selectedSchool = useAuthStore((state) => state.selectedSchool);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!selectedSchool) return;

      try {
        const response = await financeService.getExpenses(
          selectedSchool.schoolId
        );
        if (response.success) {
          setExpenses(response.data.data);
        } else {
          setError(response.message || "Failed to fetch expenses.");
        }
      } catch (err) {
        setError("An error occurred while fetching the expenses.");
      }
    };

    fetchExpenses();
  }, [selectedSchool]);

  // Define columns for the DataTable
  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "expenseDate",
      header: "Date",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div>
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (expense: Expense) => {
    // Handle edit logic
    console.log("Editing:", expense);
  };

  const handleDelete = (expense: Expense) => {
    // Handle delete logic
    console.log("Deleting:", expense);
  };

  return (
    <div>
      <h1>Expense Management</h1>
      <div style={{ marginBottom: "20px" }}>
        <Button>Record New Expense</Button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <DataTable columns={columns} data={expenses} />
    </div>
  );
};

export default withAuth(ExpensesPage, [UserRole.ADMIN, UserRole.FINANCE]);
