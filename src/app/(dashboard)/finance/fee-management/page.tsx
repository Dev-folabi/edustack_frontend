// src/app/(dashboard)/finance/fee-management/page.tsx
"use client";

import { useEffect, useState } from "react";
import { financeService } from "@/services/financeService";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";
import { DataTable } from "@/components/finance/DataTable";
import { Button } from "@/components/ui/button";
import { FeeCategory } from "@/services/financeService";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import FeeCategoryForm from "@/components/finance/FeeCategoryForm";
import FeeCategoryEditForm from "@/components/finance/FeeCategoryEditForm";

const FeeManagementPage = () => {
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFeeCategory, setSelectedFeeCategory] =
    useState<FeeCategory | null>(null);
  const selectedSchool = useAuthStore((state) => state.selectedSchool);

  useEffect(() => {
    fetchFeeCategories();
  }, [selectedSchool]);

  const fetchFeeCategories = async () => {
    if (!selectedSchool) return;

    try {
      const response = await financeService.getFeeCategories(
        selectedSchool.schoolId
      );
      if (response.success) {
        setFeeCategories(response.data.data);
      } else {
        setError(response.message || "Failed to fetch fee categories.");
      }
    } catch (err) {
      setError("An error occurred while fetching the fee categories.");
    }
  };

  const handleCreateFeeCategory = async (values: {
    name: string;
    description?: string;
  }) => {
    if (!selectedSchool) return;

    setIsLoading(true);
    try {
      const response = await financeService.createFeeCategory({
        ...values,
        schoolId: selectedSchool.schoolId,
      });
      if (response.success) {
        fetchFeeCategories(); // Refresh the list
        setIsCreateModalOpen(false); // Close the modal
      } else {
        setError(response.message || "Failed to create fee category.");
      }
    } catch (err) {
      setError("An error occurred while creating the fee category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFeeCategory = async (values: {
    name: string;
    description?: string;
  }) => {
    if (!selectedFeeCategory) return;

    setIsLoading(true);
    try {
      const response = await financeService.updateFeeCategory(
        selectedFeeCategory.id,
        values
      );
      if (response.success) {
        fetchFeeCategories(); // Refresh the list
        setIsEditModalOpen(false); // Close the modal
      } else {
        setError(response.message || "Failed to update fee category.");
      }
    } catch (err) {
      setError("An error occurred while updating the fee category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFeeCategory = async (id: string) => {
    try {
      const response = await financeService.deleteFeeCategory(id);
      if (response.success) {
        fetchFeeCategories(); // Refresh the list
      } else {
        setError(response.message || "Failed to delete fee category.");
      }
    } catch (err) {
      setError("An error occurred while deleting the fee category.");
    }
  };

  // Define columns for the DataTable
  const columns: ColumnDef<FeeCategory>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFeeCategory(row.original);
              setIsEditModalOpen(true);
            }}
          >
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  fee category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteFeeCategory(row.original.id)}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1>Fee Category Management</h1>
      <div style={{ marginBottom: "20px" }}>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>Create New Fee Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Fee Category</DialogTitle>
            </DialogHeader>
            <FeeCategoryForm
              onSubmit={handleCreateFeeCategory}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <DataTable columns={columns} data={feeCategories} />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fee Category</DialogTitle>
          </DialogHeader>
          {selectedFeeCategory && (
            <FeeCategoryEditForm
              onSubmit={handleUpdateFeeCategory}
              isLoading={isLoading}
              initialData={selectedFeeCategory}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withAuth(FeeManagementPage, [UserRole.ADMIN, UserRole.FINANCE]);
