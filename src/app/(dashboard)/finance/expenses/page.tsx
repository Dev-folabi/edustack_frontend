"use client";

import React, { useState } from "react";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "@/services/financeService";
import { useAuthStore } from "@/store/authStore";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ExpenseForm from "@/components/finance/ExpenseForm";
import { Expense } from "@/types/finance";
import { toast } from "sonner";

const ExpensesPage = () => {
  const { selectedSchool } = useAuthStore();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", selectedSchool?.schoolId],
    queryFn: () => financeService.getExpenses(selectedSchool?.schoolId || ""),
    enabled: !!selectedSchool?.schoolId,
  });

  const createMutation = useMutation({
    mutationFn: financeService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense created successfully");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create expense");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      financeService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense updated successfully");
      setIsDialogOpen(false);
      setSelectedExpense(undefined);
    },
    onError: () => {
      toast.error("Failed to update expense");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: financeService.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete expense");
    },
  });

  const handleSubmit = (values: any) => {
    if (selectedExpense) {
      updateMutation.mutate({ id: selectedExpense.id, data: values });
    } else {
      createMutation.mutate({ ...values, schoolId: selectedSchool?.schoolId });
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    deleteMutation.mutate(expense.id);
  };

  const columns = getColumns(handleEdit, handleDelete);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Expense Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedExpense(undefined)}>
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedExpense ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
            </DialogHeader>
            <ExpenseForm
              onSubmit={handleSubmit}
              initialValues={selectedExpense}
              isSubmitting={
                createMutation.isPending || updateMutation.isPending
              }
            />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable columns={columns} data={data?.data.data || []} />
      )}
    </div>
  );
};

export default withAuth(ExpensesPage, [
  UserRole.ADMIN,
  UserRole.FINANCE,
  UserRole.SUPER_ADMIN,
]);
