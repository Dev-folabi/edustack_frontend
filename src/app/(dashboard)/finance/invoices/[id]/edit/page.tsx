"use client";

import React, { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { financeService } from "@/services/financeService";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const invoiceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum([
    "UNPAID",
    "PAID",
    "PARTIALLY_PAID",
    "OVERDUE",
    "CANCELLED",
  ]),
  allowPartialPayment: z.boolean(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const EditInvoicePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const { id } = use(params);
  const { control } = useForm<InvoiceFormData>();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await financeService.getInvoiceById(id);
        const invoice = res.data;
        reset({
          title: invoice?.title ?? "",
          description: invoice?.description ?? "",
          dueDate: new Date(invoice?.dueDate ?? "").toISOString().split("T")[0],
          status: invoice?.status,
          allowPartialPayment: invoice?.allowPartialPayment ?? false,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch invoice data";
        showToast({ type: "error", title: "Error", message: errorMessage });
      }
    };
    fetchInvoice();
  }, [id, reset, showToast]);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      await financeService.updateInvoice(id, data);
      showToast({
        type: "success",
        title: "Success",
        message: "Invoice updated successfully",
      });
      router.push("/finance/fee-management");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update invoice";
      showToast({ type: "error", title: "Error", message: errorMessage });
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "DRAFT",
                        "SENT",
                        "PAID",
                        "PARTIALLY_PAID",
                        "OVERDUE",
                        "CANCELLED",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowPartialPayment"
                {...register("allowPartialPayment")}
              />
              <Label htmlFor="allowPartialPayment">Allow Partial Payment</Label>
            </div>
            <Button type="submit">Update Invoice</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default withAuth(EditInvoicePage, [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.FINANCE,
]);
