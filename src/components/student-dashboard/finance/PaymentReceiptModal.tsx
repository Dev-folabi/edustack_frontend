"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Payment } from "@/types/finance";
import { CheckCircle2 } from "lucide-react";

interface PaymentReceiptModalProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  open,
  onOpenChange,
}) => {


  if (!payment) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-8 space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-300 pb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              PAYMENT RECEIPT
            </h1>
            <p className="text-sm text-gray-600">
              Official Payment Confirmation
            </p>
          </div>

          {/* Success Icon */}
          {payment.status === "COMPLETED" && (
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          )}

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Payment Number</p>
              <p className="font-mono font-semibold text-sm">
                {payment.paymentNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">
                Transaction Reference
              </p>
              <p className="font-mono text-sm">
                {payment.transactionRef || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Payment Date</p>
              <p className="text-sm">
                {payment.paidAt
                  ? new Date(payment.paidAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Payment Time</p>
              <p className="text-sm">
                {payment.paidAt
                  ? new Date(payment.paidAt).toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Payment Method</p>
              <p className="text-sm font-medium">{payment.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <div>{getStatusBadge(payment.status)}</div>
            </div>
          </div>

          {/* Student Information */}
          {payment.studentInvoice?.student && (
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Student Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Student Name</p>
                  <p className="text-sm font-medium">
                    {payment.studentInvoice.student.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Admission Number</p>
                  <p className="text-sm font-mono">
                    {payment.studentInvoice.student.admission_number}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Information */}
          {payment.studentInvoice?.invoice && (
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Invoice Details
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Invoice Number</p>
                    <p className="text-sm font-mono">
                      {payment.studentInvoice.invoice.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Invoice Title</p>
                    <p className="text-sm font-medium">
                      {payment.studentInvoice.invoice.title}
                    </p>
                  </div>
                </div>
                {payment.studentInvoice.invoice.description && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Description</p>
                    <p className="text-sm">
                      {payment.studentInvoice.invoice.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice Items Breakdown */}
          {payment.studentInvoice?.invoice?.invoiceItems &&
            payment.studentInvoice.invoice.invoiceItems.length > 0 && (
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Fee Breakdown
                </h3>
                <div className="space-y-2">
                  {payment.studentInvoice.invoice.invoiceItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {item.feeCategory?.name || "Fee"}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-semibold">
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          minimumFractionDigits: 0,
                        }).format(item.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Payment Amount */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-800">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).format(payment.amount)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              This is an official payment receipt generated on{" "}
              {new Date().toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              For any inquiries, please contact the school administration.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentReceiptModal;
