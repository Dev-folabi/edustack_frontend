"use client";
import React, { useState, useEffect, useCallback } from "react";
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
import { financeService } from "@/services/financeService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { Payment } from "@/types/finance";

const StudentPaymentsList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, selectedSchool } = useAuthStore();

  const fetchPayments = useCallback(async () => {
    if (!user || !selectedSchool) return;
    try {
      setLoading(true);
      const response = await financeService.getStudentPayments(
        selectedSchool.schoolId,
        user.student.id
      );
      if (response.success) {
        setPayments(response.data.data);
      } else {
        throw new Error(response.message);
      }
      setError(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch payments");
      setError("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [user, selectedSchool]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default">Completed</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" text="Loading payments..." />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Payment History</h1>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-100">
                <TableHead>Payment #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.paymentNumber}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    {new Date(payment.paidAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No payments found.
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

export default StudentPaymentsList;
