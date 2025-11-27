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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Calendar, FileText } from "lucide-react";
import PaymentReceiptModal from "./PaymentReceiptModal";

const StudentPaymentsList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const { student, selectedSchool } = useAuthStore();
  const studentId = student?.id;

  const fetchPayments = useCallback(async () => {
    if (!studentId || !selectedSchool) return;
    try {
      setLoading(true);
      const response = await financeService.getPayments(
        selectedSchool.schoolId,
        "",
        studentId
      );
      if (response.success) {
        setPayments(response?.data?.data || []);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch payments");
        toast.error(response.message || "Failed to fetch payments");
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      toast.error(errMsg || "Failed to fetch payments");
      setError("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [studentId, selectedSchool]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Pending", value: "PENDING" },
    { label: "Failed", value: "FAILED" },
    { label: "Refunded", value: "REFUNDED" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            Failed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Refunded
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter((p) => {
    const statusMatch = statusFilter ? p.status === statusFilter : true;
    const q = searchQuery.trim().toLowerCase();
    const searchMatch = q
      ? p.paymentNumber.toLowerCase().includes(q) ||
        (p.transactionRef || "").toLowerCase().includes(q) ||
        p.paymentMethod.toLowerCase().includes(q)
      : true;
    return statusMatch && searchMatch;
  });

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setReceiptModalOpen(true);
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Payment History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by payment #, ref or method"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-56">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {statusOptions.find((s) => s.value === statusFilter)?.label ||
                    "Status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                {statusOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Payment #</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Transaction Ref</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((p) => (
                <TableRow key={p.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">
                    {p.paymentNumber}
                  </TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      minimumFractionDigits: 0,
                    }).format(p.amount || 0)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {p.paymentMethod}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-600 max-w-[150px] truncate">
                    {p.transactionRef || "N/A"}
                  </TableCell>
                  <TableCell>{getStatusBadge(p.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleViewReceipt(p)}>
                        Receipt
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2 font-medium">
                        No payments found
                      </p>
                      <p className="text-sm text-gray-500">
                        {searchQuery
                          ? "Try adjusting your search query"
                          : "No payments available"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {filteredPayments.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-sm text-gray-600">
                        {p.paymentNumber}
                      </p>
                      <h3 className="font-semibold text-lg mt-1">
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          minimumFractionDigits: 0,
                        }).format(p.amount || 0)}
                      </h3>
                    </div>
                    <div>{getStatusBadge(p.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-2 border-t border-b">
                    <div>
                      <p className="text-xs text-gray-600">Payment Method</p>
                      <p className="font-semibold text-sm mt-1">
                        {p.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Transaction Ref</p>
                      <p className="font-mono text-xs mt-1 truncate">
                        {p.transactionRef || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleViewReceipt(p)}>
                        Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPayments.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2 font-medium">
                No payments found
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "No payments available"}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Receipt Modal */}
      <PaymentReceiptModal
        payment={selectedPayment}
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
      />
    </Card>
  );
};

export default StudentPaymentsList;
