"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { studentService } from "@/services/student.service";
import { invoiceService } from "@/services/invoice.service";
import {
  ICreatePaymentPayload,
  paymentService,
  PaymentMethod,
} from "@/services/payment.service";
import { IStudent } from "@/types/student";
import { IInvoice } from "@/types/invoice";

const createPaymentSchema = z.object({
  studentId: z.string().nonempty("Student is required"),
  invoiceId: z.string().nonempty("Invoice is required"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedSchool } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ICreatePaymentPayload>({
    resolver: zodResolver(createPaymentSchema),
  });

  const studentId = watch("studentId");

  const { data: students, isLoading: studentsLoading } = useQuery<{
    data: IStudent[];
  }>({
    queryKey: ["students", selectedSchool?.id],
    queryFn: () => studentService.getStudents(selectedSchool?.id || ""),
    enabled: !!selectedSchool?.id,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<{
    data: IInvoice[];
  }>({
    queryKey: ["invoices", selectedSchool?.id, studentId],
    queryFn: () =>
      invoiceService.getInvoices(selectedSchool?.id || "", {
        studentId,
      }),
    enabled: !!selectedSchool?.id && !!studentId,
  });

  const createPaymentMutation = useMutation({
    mutationFn: (payload: ICreatePaymentPayload) =>
      paymentService.createPayment(selectedSchool?.id || "", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onClose();
    },
  });

  const onSubmit = (data: ICreatePaymentPayload) => {
    createPaymentMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="studentId">Student</Label>
            <Controller
              name="studentId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("invoiceId", "");
                    setValue("amount", 0);
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      students?.data.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.studentId && (
              <p className="text-red-500 text-sm">{errors.studentId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="invoiceId">Invoice</Label>
            <Controller
              name="invoiceId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const selectedInvoice = invoices?.data.find(
                      (invoice) => invoice.id === value
                    );
                    if (selectedInvoice) {
                      setValue("amount", selectedInvoice.balance);
                    }
                  }}
                  defaultValue={field.value}
                  disabled={!studentId || invoicesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoicesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      invoices?.data.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.title} - ${invoice.balance}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.invoiceId && (
              <p className="text-red-500 text-sm">{errors.invoiceId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PaymentMethod).map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={createPaymentMutation.isPending}
            >
              {createPaymentMutation.isPending ? "Creating..." : "Create"}
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

export default CreatePaymentModal;
