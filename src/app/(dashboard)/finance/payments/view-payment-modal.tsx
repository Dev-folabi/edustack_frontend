"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import { financeService } from "@/services/financeService";
import {
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  User,
  FileText,
  CreditCard,
  Calendar,
  Receipt,
  Mail,
  Phone,
  Hash,
} from "lucide-react";

interface ViewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string | null;
}

const ViewPaymentModal: React.FC<ViewPaymentModalProps> = ({
  isOpen,
  onClose,
  paymentId,
}) => {
  const { selectedSchool } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => financeService.getPaymentById(paymentId || ""),
    enabled: !!paymentId && isOpen,
  });

  const payment = data?.data;

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

  const getInvoiceStatusConfig = (status: string) => {
    const configs: {
      [key: string]: { color: string; label: string };
    } = {
      UNPAID: {
        color: "bg-red-100 text-red-800 border-red-300",
        label: "Unpaid",
      },
      PAID: {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "Paid",
      },
      PARTIALLY_PAID: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: "Partially Paid",
      },
      OVERDUE: {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        label: "Overdue",
      },
      CANCELLED: {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        label: "Cancelled",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="w-6 h-6 text-blue-600" />
            Payment Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        ) : payment ? (
          <div className="space-y-6">
            {/* Payment Header */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Number</p>
                    <p className="text-2xl font-bold font-mono text-blue-900">
                      {payment.paymentNumber}
                    </p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    {(() => {
                      const statusConfig = getStatusConfig(payment.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <Badge
                          className={`${statusConfig.color} text-sm px-3 py-1`}
                        >
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      );
                    })()}
                    <p className="text-3xl font-bold text-blue-900">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Student Information</h3>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-2xl font-semibold text-gray-900">
                          {payment.studentInvoice?.student?.name}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Hash className="w-4 h-4" />
                          <span>
                            Admission #
                            {payment.studentInvoice?.student?.admission_number}
                          </span>
                        </div>
                        {payment.studentInvoice?.student?.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">
                              {payment.studentInvoice?.student?.email}
                            </span>
                          </div>
                        )}
                        {payment.studentInvoice?.student?.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>
                              {payment.studentInvoice?.student?.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoice Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Invoice Information</h3>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Invoice Number
                        </p>
                        <p className="text-lg font-semibold font-mono">
                          {payment.studentInvoice?.invoice?.invoiceNumber}
                        </p>
                      </div>
                      <Badge
                        className={
                          getInvoiceStatusConfig(payment.studentInvoice?.status)
                            .color
                        }
                      >
                        {
                          getInvoiceStatusConfig(payment.studentInvoice?.status)
                            .label
                        }
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Title</p>
                      <p className="font-medium">
                        {payment.studentInvoice?.invoice?.title}
                      </p>
                    </div>

                    {payment.studentInvoice?.invoice?.description && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Description
                        </p>
                        <p className="text-sm bg-gray-50 p-3 rounded-lg">
                          {payment.studentInvoice?.invoice?.description}
                        </p>
                      </div>
                    )}

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Amount
                        </p>
                        <p className="font-semibold">
                          {formatCurrency(payment.studentInvoice?.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Amount Paid
                        </p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(payment.studentInvoice?.amountPaid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Amount Due</p>
                        <p className="font-semibold text-red-600">
                          {formatCurrency(payment.studentInvoice?.amountDue)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Due Date:{" "}
                        {formatDate(payment.studentInvoice?.invoice?.dueDate)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Payment Details</h3>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Payment Method
                        </p>
                        <Badge variant="outline" className="text-sm">
                          {payment.paymentMethod?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Transaction Reference
                        </p>
                        <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">
                          {payment.transactionRef}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {payment.paidAt && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Paid At</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium">
                              {formatDateTime(payment.paidAt)}
                            </p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Created At</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium">
                            {formatDateTime(payment.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {payment.gatewayResponse && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Gateway Response
                          </p>
                          <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
                            {JSON.stringify(payment.gatewayResponse, null, 2)}
                          </pre>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fee Breakdown */}
            {payment.studentInvoice?.invoice?.invoiceItems && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Receipt className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-lg">Fee Breakdown</h3>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {payment.studentInvoice.invoice.invoiceItems.map(
                        (item: any, index: number) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-blue-600">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {item.feeCategory?.name}
                                </p>
                                {(item.description ||
                                  item.feeCategory?.description) && (
                                  <p className="text-xs text-gray-500">
                                    {item.description ||
                                      item.feeCategory?.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="font-semibold">
                              {formatCurrency(item.amount)}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Metadata */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">
                  Additional Information
                </h3>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Payment ID</p>
                      <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                        {payment.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Student Invoice ID</p>
                      <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                        {payment.studentInvoiceId}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Last Updated</p>
                      <p className="font-medium">
                        {formatDateTime(payment.updatedAt)}
                      </p>
                    </div>
                    {payment.updatedBy && (
                      <div>
                        <p className="text-gray-600 mb-1">Updated By</p>
                        <p className="font-medium">{payment.updatedBy}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              No payment details found
            </p>
            <p className="text-sm text-gray-500 mt-2">
              The payment you're looking for doesn't exist or has been removed.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewPaymentModal;
