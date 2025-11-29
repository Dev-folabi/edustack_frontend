"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Calendar,
  DollarSign,
  Users,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Printer,
  Download,
  CreditCard,
  User,
  Search,
  Filter,
} from "lucide-react";
import { financeService } from "@/services/financeService";
import { useToast } from "@/components/ui/Toast";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { BackButton } from "@/components/ui/BackButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Invoice, InvoiceItem, Payment, StudentInvoice } from "@/types/finance";

const InvoiceDetailsPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = use(params);
  const { showToast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    try {
      const response = await financeService.getInvoiceById(id);
      if (response.success) {
        setInvoice(response.data as Invoice);
      } else {
        showToast({
          type: "error",
          title: "Error",
          message: response.message || "Failed to fetch invoice details",
        });
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message:
          error.message || "An error occurred while fetching invoice details",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: {
      [key: string]: {
        color: string;
        label: string;
        icon: any;
      };
    } = {
      UNPAID: {
        color: "bg-red-100 text-red-800 border-red-300",
        label: "Unpaid",
        icon: XCircle,
      },
      PAID: {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "Paid",
        icon: CheckCircle,
      },
      PARTIALLY_PAID: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: "Partially Paid",
        icon: Clock,
      },
      OVERDUE: {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        label: "Overdue",
        icon: AlertCircle,
      },
      CANCELLED: {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        label: "Cancelled",
        icon: XCircle,
      },
    };
    return configs[status] || configs.UNPAID;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter student invoices
  const filteredStudentInvoices =
    invoice?.studentInvoices?.filter((studentInvoice: StudentInvoice) => {
      const matchesStatus =
        statusFilter === "all" || studentInvoice.status === statusFilter;
      const matchesSearch =
        studentInvoice.student?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        studentInvoice.student?.admission_number
          ?.toString()
          .includes(searchQuery);
      return matchesStatus && matchesSearch;
    }) || [];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast({
      type: "info",
      title: "Coming Soon",
      message: "PDF download feature will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="py-24">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="text-gray-600">Loading invoice details...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="py-24">
              <div className="text-center space-y-4">
                <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-gray-600">Invoice not found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Invoice Details
              </h1>
              <p className="text-gray-600 mt-1">
                Invoice #{invoice.invoiceNumber}
              </p>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(invoice.totalAmount || 0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(invoice.amountPaid || 0)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Amount Due</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(invoice.amountDue || 0)}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold mt-1">
                    {invoice.studentInvoices?.length || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Invoice Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Invoice Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Invoice Number</p>
                    <p className="font-semibold text-lg">
                      {invoice.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">
                        {formatDate(
                          invoice.dueDate || new Date().toISOString()
                        )}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-medium">{invoice.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Partial Payment</p>
                    <Badge variant="outline" className="mt-1">
                      {invoice.allowPartialPayment ? "Allowed" : "Not Allowed"}
                    </Badge>
                  </div>
                </div>

                {invoice.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{invoice.description}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Session</p>
                    <p className="font-medium">{invoice.session?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(
                        invoice.session?.start_date || new Date().toISOString()
                      )}{" "}
                      -{" "}
                      {formatDate(
                        invoice.session?.end_date || new Date().toISOString()
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Term</p>
                    <p className="font-medium">{invoice.term?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(
                        invoice.term?.start_date || new Date().toISOString()
                      )}{" "}
                      -{" "}
                      {formatDate(
                        invoice.term?.end_date || new Date().toISOString()
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Fee Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Fee Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.invoiceItems?.map(
                        (item: InvoiceItem, index: number) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-gray-600">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.feeCategory?.name || "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {item.description ||
                                item.feeCategory?.description ||
                                "-"}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(item.amount)}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={3} className="text-right">
                          Total Amount
                        </TableCell>
                        <TableCell className="text-right text-lg">
                          {formatCurrency(invoice.totalAmount || 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Student Invoices Details */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Student Invoice Details
                    {filteredStudentInvoices.length !==
                      invoice.studentInvoices?.length && (
                      <span className="text-sm font-normal text-gray-500">
                        ({filteredStudentInvoices.length} of{" "}
                        {invoice.studentInvoices?.length})
                      </span>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by student name or admission number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PARTIALLY_PAID">
                        Partially Paid
                      </SelectItem>
                      <SelectItem value="UNPAID">Unpaid</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredStudentInvoices.length > 0 ? (
                  <div className="space-y-4">
                    {filteredStudentInvoices.map(
                      (studentInvoice: StudentInvoice) => {
                        const statusConfig = getStatusConfig(
                          studentInvoice.status
                        );
                        const StatusIcon = statusConfig.icon;
                        const paymentProgress =
                          studentInvoice.totalAmount > 0
                            ? (studentInvoice.amountPaid /
                                studentInvoice.totalAmount) *
                              100
                            : 0;

                        return (
                          <div
                            key={studentInvoice.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            {/* Student Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-lg">
                                    {studentInvoice.student?.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Admission #
                                    {studentInvoice.student?.admission_number}
                                  </p>
                                </div>
                              </div>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>

                            {/* Financial Summary */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">
                                  Total Amount
                                </p>
                                <p className="font-semibold text-sm">
                                  {formatCurrency(studentInvoice.totalAmount)}
                                </p>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">
                                  Paid
                                </p>
                                <p className="font-semibold text-sm text-green-700">
                                  {formatCurrency(studentInvoice.amountPaid)}
                                </p>
                              </div>
                              <div className="bg-red-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">
                                  Due
                                </p>
                                <p className="font-semibold text-sm text-red-700">
                                  {formatCurrency(studentInvoice.amountDue)}
                                </p>
                              </div>
                            </div>

                            {/* Payment Progress Bar */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-600">
                                  Payment Progress
                                </span>
                                <span className="text-xs font-semibold text-gray-900">
                                  {paymentProgress.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    paymentProgress === 100
                                      ? "bg-green-600"
                                      : paymentProgress > 0
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${paymentProgress}%` }}
                                />
                              </div>
                            </div>

                            {/* Assignment Info */}
                            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                              <span>
                                Assigned:{" "}
                                {formatDateTime(studentInvoice.assignedAt)}
                              </span>
                              <span className="font-mono">
                                {studentInvoice.id}
                              </span>
                            </div>

                            {/* Payments for this student */}
                            {studentInvoice.payments &&
                              studentInvoice.payments.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                  <p className="text-sm font-semibold mb-3">
                                    Payment History
                                  </p>
                                  <div className="space-y-2">
                                    {studentInvoice.payments.map(
                                      (payment: Payment) => (
                                        <div
                                          key={payment.id}
                                          className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs"
                                        >
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="font-mono">
                                              {payment.paymentNumber}
                                            </span>
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {payment.paymentMethod}
                                            </Badge>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                              {formatCurrency(payment.amount)}
                                            </p>
                                            <p className="text-gray-500">
                                              {formatDateTime(
                                                payment.createdAt
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2 font-medium">
                      {searchQuery || statusFilter !== "all"
                        ? "No students match your filters"
                        : "No students assigned to this invoice"}
                    </p>
                    {(searchQuery || statusFilter !== "all") && (
                      <p className="text-sm text-gray-500">
                        Try adjusting your search or filter criteria
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Paid Students</span>
                    <span className="text-xs font-semibold">
                      {invoice.studentInvoices?.filter(
                        (si: StudentInvoice) => si.status === "PAID"
                      ).length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">
                      Partially Paid
                    </span>
                    <span className="text-xs font-semibold">
                      {invoice.studentInvoices?.filter(
                        (si: StudentInvoice) => si.status === "PARTIALLY_PAID"
                      ).length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Unpaid</span>
                    <span className="text-xs font-semibold">
                      {invoice.studentInvoices?.filter(
                        (si: StudentInvoice) => si.status === "UNPAID"
                      ).length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Overdue</span>
                    <span className="text-xs font-semibold text-red-600">
                      {invoice.studentInvoices?.filter(
                        (si: StudentInvoice) => si.status === "OVERDUE"
                      ).length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Invoice Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Created At</p>
                  <p className="text-sm font-medium">
                    {formatDateTime(invoice.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Last Updated</p>
                  <p className="text-sm font-medium">
                    {formatDateTime(invoice.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Invoice ID</p>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                    {invoice.id}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(InvoiceDetailsPage, [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.FINANCE,
]);
