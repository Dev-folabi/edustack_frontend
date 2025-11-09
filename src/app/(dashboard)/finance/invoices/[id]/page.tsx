"use client";

import { useState, useEffect, use } from "react";
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
  ArrowLeft,
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
} from "lucide-react";
import { financeService } from "@/services/financeService";
import { useToast } from "@/components/ui/Toast";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { BackButton } from "@/components/ui/BackButton";
import { useRouter } from "next/navigation";

const InvoiceDetailsPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = use(params);
  const { showToast } = useToast();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    try {
      const response = await financeService.getInvoiceById(id);
      if (response.success) {
        setInvoice(response.data);
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
      [key: string]: { color: string; icon: any; label: string };
    } = {
      DRAFT: {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: FileText,
        label: "Draft",
      },
      SENT: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: Clock,
        label: "Sent",
      },
      PAID: {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
        label: "Paid",
      },
      PARTIALLY_PAID: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: AlertCircle,
        label: "Partially Paid",
      },
      OVERDUE: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: XCircle,
        label: "Overdue",
      },
      CANCELLED: {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: XCircle,
        label: "Cancelled",
      },
    };
    return configs[status] || configs.DRAFT;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download logic
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

  const statusConfig = getStatusConfig(invoice.status);
  const StatusIcon = statusConfig.icon;

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

        {/* Status and Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    className={`${statusConfig.color} mt-2 flex items-center gap-1 w-fit`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <StatusIcon className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(invoice.totalAmount)}
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
                    {formatCurrency(invoice.amountPaid)}
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
                    {formatCurrency(invoice.amountDue)}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
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
                        {formatDate(invoice.dueDate)}
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
                      {formatDate(invoice.session?.start_date)} -{" "}
                      {formatDate(invoice.session?.end_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Term</p>
                    <p className="font-medium">{invoice.term?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(invoice.term?.start_date)} -{" "}
                      {formatDate(invoice.term?.end_date)}
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
                      {invoice.invoiceItems?.map((item: any, index: number) => (
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
                      ))}
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={3} className="text-right">
                          Total Amount
                        </TableCell>
                        <TableCell className="text-right text-lg">
                          {formatCurrency(invoice.totalAmount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            {invoice.payments && invoice.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.payments.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {formatDateTime(payment.createdAt)}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {payment.reference}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{payment.method}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Students & Metadata */}
          <div className="space-y-6">
            {/* Assigned Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Assigned Students ({invoice.studentInvoices?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoice.studentInvoices &&
                invoice.studentInvoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoice.studentInvoices.map((studentInvoice: any) => (
                      <div
                        key={studentInvoice.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {studentInvoice.student?.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Admission #:{" "}
                            {studentInvoice.student?.admission_number}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned: {formatDate(studentInvoice.assignedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      No students assigned
                    </p>
                  </div>
                )}
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
