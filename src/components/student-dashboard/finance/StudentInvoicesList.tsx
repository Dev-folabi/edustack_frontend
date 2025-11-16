"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/button";
import { financeService } from "@/services/financeService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { StudentInvoice } from "@/types/finance";

const StudentInvoicesList = () => {
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, selectedSchool } = useAuthStore();
  const studentId = user?.student?.id;

  const fetchInvoices = useCallback(async () => {
    if (!studentId || !selectedSchool) return;
    try {
      setLoading(true);
      const response = await financeService.getStudentInvoices(
        selectedSchool.schoolId,
        studentId
      );
      if (response.success) {
        setInvoices(response.data.data);
      } else {
        throw new Error(response.message);
      }
      setError(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch invoices");
      setError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, [studentId, selectedSchool]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="default">Paid</Badge>;
      case "PARTIALLY_PAID":
        return <Badge variant="secondary">Partially Paid</Badge>;
      case "UNPAID":
        return <Badge variant="destructive">Unpaid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" text="Loading invoices..." />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Invoices</h1>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-100">
                <TableHead>Title</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice.title}</TableCell>
                  <TableCell>{invoice.invoice.totalAmount}</TableCell>
                  <TableCell>{invoice.paidAmount}</TableCell>
                  <TableCell>{invoice.dueAmount}</TableCell>
                  <TableCell>
                    {new Date(invoice.invoice.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    {invoice.status !== "PAID" && (
                      <Button asChild>
                        <Link href={`/student/finance/make-payment?invoiceId=${invoice.id}`}>
                          Make Payment
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default StudentInvoicesList;
