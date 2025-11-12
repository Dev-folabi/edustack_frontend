"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { paymentService } from "@/services/payment.service";

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
    queryKey: ["payment", selectedSchool?.id, paymentId],
    queryFn: () =>
      paymentService.getPaymentById(selectedSchool?.id || "", paymentId || ""),
    enabled: !!selectedSchool?.id && !!paymentId,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <p>Loading...</p>
        ) : data ? (
          <div className="space-y-4">
            <p>
              <strong>ID:</strong> {data.data.id}
            </p>
            <p>
              <strong>Student ID:</strong> {data.data.studentId}
            </p>
            <p>
              <strong>Invoice ID:</strong> {data.data.invoiceId}
            </p>
            <p>
              <strong>Amount:</strong> ${data.data.amount}
            </p>
            <p>
              <strong>Payment Method:</strong> {data.data.paymentMethod}
            </p>
            <p>
              <strong>Status:</strong> {data.data.status}
            </p>
            <p>
              <strong>Transaction Reference:</strong> {data.data.transactionRef}
            </p>
          </div>
        ) : (
          <p>No payment details found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewPaymentModal;
