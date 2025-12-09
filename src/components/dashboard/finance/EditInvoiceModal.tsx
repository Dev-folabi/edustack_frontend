"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import { financeService } from "@/services/financeService";
import { Invoice } from "@/types/finance";

const invoiceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  allowPartialPayment: z.boolean().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface EditInvoiceModalProps {
  invoice?: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export const EditInvoiceModal = ({
  invoice,
  open,
  onOpenChange,
  onUpdated,
}: EditInvoiceModalProps) => {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      allowPartialPayment: false,
    },
  });

  useEffect(() => {
    if (open && invoice) {
      reset({
        title: invoice.title ?? "",
        description: invoice.description ?? "",
        dueDate: new Date(invoice.dueDate ?? "").toISOString().split("T")[0],
        allowPartialPayment: invoice.allowPartialPayment ?? false,
      });
    }
  }, [open, invoice, reset]);

  const onSubmit = async (data: InvoiceFormData) => {
    if (!invoice) return;
    try {
      await financeService.updateInvoice(invoice.id, data);
      showToast({
        type: "success",
        title: "Success",
        message: "Invoice updated successfully",
      });
      onOpenChange(false);
      onUpdated?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update invoice";
      showToast({ type: "error", title: "Error", message: errorMessage });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Edit Invoice{" "}
            {invoice?.invoiceNumber ? `#${invoice.invoiceNumber}` : ""}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
            {errors.dueDate && (
              <p className="text-red-500 text-sm">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="allowPartialPayment"
              type="checkbox"
              {...register("allowPartialPayment")}
            />
            <Label htmlFor="allowPartialPayment">Allow Partial Payment</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceModal;
