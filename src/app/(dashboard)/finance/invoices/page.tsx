// src/app/(dashboard)/finance/invoices/page.tsx
"use client";

import { useEffect, useState } from "react";
import { financeService } from "@/services/financeService";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";
import { DataTable } from "@/components/finance/DataTable";
import { Button } from "@/components/ui/button";
import { Invoice, FeeCategory } from "@/services/financeService";
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
import InvoiceForm from "@/components/finance/InvoiceForm";

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
    null
  );
  const selectedSchool = useAuthStore((state) => state.selectedSchool);

  useEffect(() => {
    fetchInvoices();
    fetchFeeCategories();
  }, [selectedSchool]);

  const fetchInvoices = async () => {
    if (!selectedSchool) return;

    try {
      const response = await financeService.getInvoices();
      if (response.success) {
        setInvoices(response.data.data);
      } else {
        setError(response.message || "Failed to fetch invoices.");
      }
    } catch (err) {
      setError("An error occurred while fetching the invoices.");
    }
  };

  const fetchFeeCategories = async () => {
    if (!selectedSchool) return;
    try {
      const response = await financeService.getFeeCategories(selectedSchool.schoolId);
      if(response.success){
        setFeeCategories(response.data.data);
      }
    } catch (error) {
      console.error(error)
    }
  };

  const handleCreateInvoice = async (values: any) => {
    if (!selectedSchool) return;

    setIsLoading(true);
    try {
      const response = await financeService.createAndAssignInvoice({
        ...values,
        schoolId: selectedSchool.schoolId,
        termId: "termId", //These need to be dynamic
        sessionId: "sessionId", //These need to be dynamic
      });
      if (response.success) {
        fetchInvoices();
        setIsCreateModalOpen(false);
      } else {
        setError(response.message || "Failed to create invoice.");
      }
    } catch (err) {
      setError("An error occurred while creating the invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInvoice = async (values: any) => {
    if (!selectedInvoice) return;

    setIsLoading(true);
    try {
      const response = await financeService.updateInvoice(
        selectedInvoice.id,
        values
      );
      if (response.success) {
        fetchInvoices();
        setIsEditModalOpen(false);
      } else {
        setError(response.message || "Failed to update invoice.");
      }
    } catch (err) {
      setError("An error occurred while updating the invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      const response = await financeService.deleteInvoice(id);
      if (response.success) {
        fetchInvoices();
      } else {
        setError(response.message || "Failed to delete invoice.");
      }
    } catch (err) {
      setError("An error occurred while deleting the invoice.");
    }
  };

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
    {
      id: "actions",
      cell: ({ row }) => (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedInvoice(row.original);
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
                  invoice.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteInvoice(row.original.id)}
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
      <h1>Invoice Management</h1>
      <div style={{ marginBottom: "20px" }}>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>Create New Invoice</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm
              onSubmit={handleCreateInvoice}
              isLoading={isLoading}
              feeCategories={feeCategories}
            />
          </DialogContent>
        </Dialog>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <DataTable columns={columns} data={invoices} />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <InvoiceForm
              onSubmit={handleUpdateInvoice}
              isLoading={isLoading}
              initialData={selectedInvoice}
              feeCategories={feeCategories}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withAuth(InvoicesPage, [UserRole.ADMIN, UserRole.FINANCE]);
