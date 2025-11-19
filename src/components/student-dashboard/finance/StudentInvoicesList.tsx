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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Calendar, FileText } from "lucide-react";

const StudentInvoicesList = () => {
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { student, selectedSchool } = useAuthStore();
  const studentId = student?.id;

  const fetchInvoices = useCallback(async () => {
    if (!studentId || !selectedSchool) return;
    try {
      setLoading(true);
      const response = await financeService.getInvoicesByStudent(
        studentId,
        selectedSchool.schoolId
      );
      if (response.success) {
        setInvoices(response?.data?.data || []);
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

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Unpaid", value: "UNPAID" },
    { label: "Paid", value: "PAID" },
    { label: "Partially Paid", value: "PARTIALLY_PAID" },
    { label: "Overdue", value: "OVERDUE" },
  ];

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
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter ? inv.status === statusFilter : true;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q
      ? inv.invoice.title.toLowerCase().includes(q) ||
        (inv.invoice.invoiceNumber || "").toLowerCase().includes(q)
      : true;
    return matchesStatus && matchesSearch;
  });

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Invoices</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by title or invoice #"
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

        {/* Table (desktop) */}
        <div className="hidden md:block rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-gray-50">
                  <TableCell>{invoice.invoice.title}</TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      minimumFractionDigits: 0,
                    }).format(invoice.invoice.totalAmount || 0)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600 whitespace-nowrap">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      minimumFractionDigits: 0,
                    }).format(invoice.amountPaid || 0)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-red-600 whitespace-nowrap">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      minimumFractionDigits: 0,
                    }).format(invoice.amountDue || 0)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {invoice.invoice.dueDate
                          ? new Date(
                              invoice.invoice.dueDate
                            ).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    {invoice.status !== "PAID" ? (
                      <Button asChild>
                        <Link
                          href={`/student/finance/make-payment?invoiceId=${invoice.id}`}
                        >
                          Make Payment
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2 font-medium">
                        No invoices found
                      </p>
                      <p className="text-sm text-gray-500">
                        {searchQuery
                          ? "Try adjusting your search query"
                          : "No invoices available"}
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
          {filteredInvoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-sm text-gray-600">
                        {invoice.invoice.invoiceNumber}
                      </p>
                      <h3 className="font-semibold text-lg mt-1">
                        {invoice.invoice.title}
                      </h3>
                    </div>
                    <div>{getStatusBadge(invoice.status)}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-b">
                    <div>
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="font-semibold text-sm mt-1">
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          minimumFractionDigits: 0,
                        }).format(invoice.invoice.totalAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Paid</p>
                      <p className="font-semibold text-sm text-green-600 mt-1">
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          minimumFractionDigits: 0,
                        }).format(invoice.amountPaid || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Due</p>
                      <p className="font-semibold text-sm text-red-600 mt-1">
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          minimumFractionDigits: 0,
                        }).format(invoice.amountDue || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Due:{" "}
                        {invoice.invoice.dueDate
                          ? new Date(
                              invoice.invoice.dueDate
                            ).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                            })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {invoice.status !== "PAID" && (
                        <Button asChild size="sm">
                          <Link
                            href={`/student/finance/make-payment?invoiceId=${invoice.id}`}
                          >
                            Pay
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInvoicesList;
