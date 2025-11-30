"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { financeService } from "@/services/financeService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreatePaymentModal from "./create-payment-modal";
import ViewPaymentModal from "./view-payment-modal";
import UpdatePaymentStatusModal from "./update-payment-status-modal";
import { PaymentStatus } from "@/types/finance";
import {
  DollarSign,
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";

const PaymentsPage = () => {
  const { selectedSchool } = useAuthStore();
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
  const [isViewModalOpen, setViewModalOpen] = React.useState(false);
  const [isUpdateStatusModalOpen, setUpdateStatusModalOpen] =
    React.useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<
    string | null
  >(null);

  const { data, isLoading } = useQuery({
    queryKey: ["payments", selectedSchool?.schoolId, page, status],
    queryFn: () =>
      financeService.getPayments(
        selectedSchool?.schoolId || "",
        status === "all" ? "" : status,
        page
      ),
    enabled: !!selectedSchool?.schoolId,
  });

  const handleViewPayment = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setViewModalOpen(true);
  };

  const handleUpdateStatus = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setUpdateStatusModalOpen(true);
  };

  const getStatusConfig = (status: string) => {
    const configs: {
      [key: string]: { color: string; label: string; icon: any };
    } = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: "Pending",
        icon: Clock,
      },
      COMPLETED: {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "Completed",
        icon: CheckCircle,
      },
      FAILED: {
        color: "bg-red-100 text-red-800 border-red-300",
        label: "Failed",
        icon: XCircle,
      },
      REFUNDED: {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        label: "Refunded",
        icon: AlertCircle,
      },
    };
    return configs[status] || configs.PENDING;
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
      month: "short",
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

  const filteredPayments =
    data?.data?.data?.filter(
      (payment: any) =>
        payment.paymentNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        payment.studentInvoice?.student?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        payment.studentInvoice?.invoice?.invoiceNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    ) || [];

  // Calculate summary stats
  const stats = React.useMemo(() => {
    const allPayments = data?.data?.data || [];
    return {
      total: allPayments.reduce((sum: number, p: any) => sum + p.amount, 0),
      completed: allPayments
        .filter((p: any) => p.status === "COMPLETED")
        .reduce((sum: number, p: any) => sum + p.amount, 0),
      pending: allPayments
        .filter((p: any) => p.status === "PENDING")
        .reduce((sum: number, p: any) => sum + p.amount, 0),
      count: allPayments.length,
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all payment transactions
            </p>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Payment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold mt-1">{stats.count}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(stats.total)}
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
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(stats.completed)}
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
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {formatCurrency(stats.pending)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by payment number, student name, or invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={PaymentStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                  <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                  <SelectItem value={PaymentStatus.REFUNDED}>
                    Refunded
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Transactions
              {filteredPayments.length !== data?.data?.data?.length && (
                <span className="text-sm font-normal text-gray-500">
                  ({filteredPayments.length} of {data?.data?.data?.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredPayments.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Payment #</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment: any) => {
                        const statusConfig = getStatusConfig(payment.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <TableRow
                            key={payment.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-mono text-sm font-medium">
                              {payment.paymentNumber}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate">
                                    {payment.studentInvoice?.student?.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    #
                                    {
                                      payment.studentInvoice?.student
                                        ?.admission_number
                                    }
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">
                                  {
                                    payment.studentInvoice?.invoice
                                      ?.invoiceNumber
                                  }
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {payment.studentInvoice?.invoice?.title}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {payment.paymentMethod?.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                {payment.paidAt
                                  ? formatDate(payment.paidAt)
                                  : formatDate(payment.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleViewPayment(payment.id)
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {payment.status === PaymentStatus.PENDING && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleUpdateStatus(payment.id)
                                        }
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Update Status
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredPayments.map((payment: any) => {
                    const statusConfig = getStatusConfig(payment.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <Card
                        key={payment.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-mono text-sm text-gray-600">
                                  {payment.paymentNumber}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">
                                      {payment.studentInvoice?.student?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Adm #
                                      {
                                        payment.studentInvoice?.student
                                          ?.admission_number
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>

                            {/* Invoice Info */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">
                                Invoice
                              </p>
                              <p className="font-medium text-sm">
                                {payment.studentInvoice?.invoice?.invoiceNumber}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {payment.studentInvoice?.invoice?.title}
                              </p>
                            </div>

                            {/* Amount and Method */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">
                                  Amount
                                </p>
                                <p className="font-semibold text-lg">
                                  {formatCurrency(payment.amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">
                                  Method
                                </p>
                                <Badge variant="outline">
                                  {payment.paymentMethod?.replace(/_/g, " ")}
                                </Badge>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {payment.paidAt
                                  ? formatDateTime(payment.paidAt)
                                  : formatDateTime(payment.createdAt)}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleViewPayment(payment.id)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              {payment.status === PaymentStatus.PENDING && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleUpdateStatus(payment.id)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Update
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {data?.data?.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-600">
                      Page {page} of {data.data.totalPages} (
                      {data.data.totalItems} total payments)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, data.data.totalPages) },
                          (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  page === pageNum ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setPage(pageNum)}
                                className="w-10"
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                        {data.data.totalPages > 5 && (
                          <>
                            <span className="px-2 text-gray-500">...</span>
                            <Button
                              variant={
                                page === data.data.totalPages
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setPage(data.data.totalPages)}
                              className="w-10"
                            >
                              {data.data.totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(data.data.totalPages, p + 1))
                        }
                        disabled={page === data.data.totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">
                  No payments found
                </p>
                <p className="text-sm text-gray-500">
                  {searchQuery || status !== "all"
                    ? "Try adjusting your filters or search query"
                    : "Create your first payment to get started"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreatePaymentModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <ViewPaymentModal
        isOpen={isViewModalOpen}
        onClose={() => setViewModalOpen(false)}
        paymentId={selectedPaymentId}
      />
      <UpdatePaymentStatusModal
        isOpen={isUpdateStatusModalOpen}
        onClose={() => setUpdateStatusModalOpen(false)}
        paymentId={selectedPaymentId}
      />
    </div>
  );
};

export default withAuth(PaymentsPage, [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.FINANCE,
]);
