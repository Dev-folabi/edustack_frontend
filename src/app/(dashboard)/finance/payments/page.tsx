"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/ui/data-table";
import { getPaymentColumns } from "./payment-columns";
import { financeService } from "@/services/financeService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import CreatePaymentModal from "./create-payment-modal";
import ViewPaymentModal from "./view-payment-modal";
import UpdatePaymentStatusModal from "./update-payment-status-modal";
import { PaymentStatus } from "@/types/finance";

const PaymentsPage = () => {
  const { selectedSchool } = useAuthStore();
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState("");
  const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
  const [isViewModalOpen, setViewModalOpen] = React.useState(false);
  const [isUpdateStatusModalOpen, setUpdateStatusModalOpen] =
    React.useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<string | null>(
    null
  );

  const { data, isLoading } = useQuery({
    queryKey: ["payments", selectedSchool?.id, page, status],
    queryFn: () =>
      financeService.getPayments(selectedSchool?.id || "", status, page),
    enabled: !!selectedSchool?.id,
  });

  const handleViewPayment = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setViewModalOpen(true);
  };

  const handleUpdateStatus = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setUpdateStatusModalOpen(true);
  };

  const paymentColumns = getPaymentColumns({
    onView: handleViewPayment,
    onUpdateStatus: handleUpdateStatus,
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Payments</h1>
        <Button onClick={() => setCreateModalOpen(true)}>Create Payment</Button>
      </div>

      <DataTable
        columns={paymentColumns}
        data={data?.data.data || []}
        isLoading={isLoading}
        pagination={{
          page,
          pageCount: data?.data.totalPages || 1,
          onPageChange: setPage,
        }}
        filter={{
          value: status,
          onChange: setStatus,
          placeholder: "Filter by status...",
          options: [
            { label: "All", value: "" },
            { label: "Pending", value: PaymentStatus.PENDING },
            { label: "Completed", value: PaymentStatus.COMPLETED },
            { label: "Failed", value: PaymentStatus.FAILED },
            { label: "Refunded", value: PaymentStatus.REFUNDED },
          ],
        }}
      />
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

export default PaymentsPage;
