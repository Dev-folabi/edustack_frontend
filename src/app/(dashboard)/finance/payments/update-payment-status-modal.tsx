"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { financeService } from "@/services/financeService";
import { PaymentStatus } from "@/types/finance";
import { useToast } from "@/components/ui/Toast";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Edit,
  Info,
  User,
  FileText,
  DollarSign,
} from "lucide-react";

const updatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
});

type UpdatePaymentStatusForm = z.infer<typeof updatePaymentStatusSchema>;

interface UpdatePaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string | null;
}

const UpdatePaymentStatusModal: React.FC<UpdatePaymentStatusModalProps> = ({
  isOpen,
  onClose,
  paymentId,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdatePaymentStatusForm>({
    resolver: zodResolver(updatePaymentStatusSchema),
    defaultValues: {
      status: PaymentStatus.PENDING,
    },
  });

  const selectedStatus = watch("status");

  // Fetch payment details
  const { data: paymentData, isLoading: isLoadingPayment } = useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => financeService.getPaymentById(paymentId || ""),
    enabled: !!paymentId && isOpen,
  });

  const payment = paymentData?.data;

  const updatePaymentStatusMutation = useMutation({
    mutationFn: (status: PaymentStatus) =>
      financeService.updatePaymentStatus(paymentId || "", status),
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Success",
        message: "Payment status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", paymentId] });
      handleClose();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update payment status";
      showToast({
        type: "error",
        title: "Error",
        message,
      });
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: UpdatePaymentStatusForm) => {
    if (data.status === payment?.status) {
      showToast({
        type: "info",
        title: "Info",
        message: "Status is already set to this value",
      });
      return;
    }
    updatePaymentStatusMutation.mutate(data.status);
  };

  const getStatusConfig = (status: string) => {
    const configs: {
      [key: string]: {
        color: string;
        label: string;
        icon: any;
        description: string;
      };
    } = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: "Pending",
        icon: Clock,
        description: "Payment is awaiting confirmation or processing",
      },
      COMPLETED: {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "Completed",
        icon: CheckCircle,
        description: "Payment has been successfully processed and confirmed",
      },
      FAILED: {
        color: "bg-red-100 text-red-800 border-red-300",
        label: "Failed",
        icon: XCircle,
        description: "Payment processing failed or was declined",
      },
      REFUNDED: {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        label: "Refunded",
        icon: AlertCircle,
        description: "Payment has been refunded to the payer",
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit className="w-6 h-6 text-blue-600" />
            Update Payment Status
          </DialogTitle>
          <DialogDescription>
            Change the status of this payment transaction
          </DialogDescription>
        </DialogHeader>

        {isLoadingPayment ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600 text-sm">Loading payment details...</p>
          </div>
        ) : payment ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Payment Info */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Payment Number & Current Status */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Payment Number
                      </p>
                      <p className="text-lg font-semibold font-mono">
                        {payment.paymentNumber}
                      </p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <p className="text-xs text-gray-600">Current Status</p>
                      {(() => {
                        const statusConfig = getStatusConfig(payment.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Student & Invoice Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-600">Student</p>
                      </div>
                      <p className="font-medium text-sm">
                        {payment.studentInvoice?.student?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Adm #{payment.studentInvoice?.student?.admission_number}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-600">Invoice</p>
                      </div>
                      <p className="font-medium text-sm">
                        {payment.studentInvoice?.invoice?.invoiceNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payment.studentInvoice?.invoice?.title}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-600">Payment Amount</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Selection */}
            <div className="space-y-3">
              <Label htmlFor="status" className="text-base font-semibold">
                New Status <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select new payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PaymentStatus).map((status) => {
                        const config = getStatusConfig(status);
                        const StatusIcon = config.icon;
                        return (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2 py-1">
                              <StatusIcon className="w-4 h-4" />
                              <span className="font-medium">
                                {config.label}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Status Description */}
            {selectedStatus && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                  <span className="font-semibold">
                    {getStatusConfig(selectedStatus).label}:
                  </span>{" "}
                  {getStatusConfig(selectedStatus).description}
                </AlertDescription>
              </Alert>
            )}

            {/* Warning if same status */}
            {selectedStatus === payment.status && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm text-yellow-900">
                  This payment is already marked as{" "}
                  <span className="font-semibold">
                    {getStatusConfig(payment.status).label}
                  </span>
                  . Updating will not change the status.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updatePaymentStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatePaymentStatusMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updatePaymentStatusMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Payment not found</p>
            <p className="text-sm text-gray-500 mt-2">
              Unable to load payment details
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePaymentStatusModal;
