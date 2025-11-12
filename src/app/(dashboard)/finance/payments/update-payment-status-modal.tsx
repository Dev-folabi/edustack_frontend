"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useAuthStore } from "@/store/authStore";
import { paymentService, PaymentStatus } from "@/services/payment.service";

const updatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
});

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
  const { selectedSchool } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ status: PaymentStatus }>({
    resolver: zodResolver(updatePaymentStatusSchema),
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: (status: PaymentStatus) =>
      paymentService.updatePaymentStatus(
        selectedSchool?.id || "",
        paymentId || "",
        status
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onClose();
    },
  });

  const onSubmit = (data: { status: PaymentStatus }) => {
    updatePaymentStatusMutation.mutate(data.status);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Payment Status</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PaymentStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={updatePaymentStatusMutation.isPending}
            >
              {updatePaymentStatusMutation.isPending ? "Updating..." : "Update"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePaymentStatusModal;
