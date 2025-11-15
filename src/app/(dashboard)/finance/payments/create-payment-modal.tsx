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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { studentService } from "@/services/studentService";
import { classService } from "@/services/classService";
import { financeService } from "@/services/financeService";
import { PaymentMethod } from "@/types/finance";
import { toast } from "sonner";
import {
  DollarSign,
  Calendar,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  CreditCard,
} from "lucide-react";

const createPaymentSchema = z.object({
  studentInvoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

type PaymentFormData = z.infer<typeof createPaymentSchema>;

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedSchool } = useAuthStore();
  const [selectedClassId, setSelectedClassId] = React.useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = React.useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>("");
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      studentInvoiceId: "",
      amount: 0,
      paymentMethod: PaymentMethod.CASH,
    },
  });

  const selectedInvoiceId = watch("studentInvoiceId");

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["classes", selectedSchool?.schoolId],
    queryFn: () => classService.getClasses(selectedSchool?.schoolId || ""),
    enabled: !!selectedSchool?.schoolId && isOpen,
  });

  const sections = React.useMemo(() => {
    if (!selectedClassId || !classes?.data?.data) return [];
    const selectedClass = classes.data.data.find(
      (c: any) => c.id === selectedClassId
    );
    return selectedClass?.sections || [];
  }, [classes, selectedClassId]);

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: [
      "students",
      selectedSchool?.schoolId,
      selectedClassId,
      selectedSectionId,
    ],
    queryFn: () =>
      studentService.getStudentsBySection(selectedSchool?.schoolId || "", {
        classId: selectedClassId || undefined,
        sectionId: selectedSectionId || undefined,
      }),
    enabled:
      !!selectedSchool?.schoolId &&
      !!selectedClassId &&
      !!selectedSectionId &&
      isOpen,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["student-invoices", selectedStudentId, selectedSchool?.schoolId],
    queryFn: () =>
      financeService.getInvoicesByStudent(
        selectedStudentId,
        selectedSchool?.schoolId || ""
      ),
    enabled: !!selectedStudentId && !!selectedSchool?.schoolId && isOpen,
  });

  const selectedInvoice = React.useMemo(() => {
    if (!selectedInvoiceId || !invoices?.data?.data) return null;
    return invoices.data.data.find((inv: any) => inv.id === selectedInvoiceId);
  }, [selectedInvoiceId, invoices]);

  const createPaymentMutation = useMutation({
    mutationFn: (data: PaymentFormData & { schoolId: string }) =>
      financeService.createPayment(data),
    onSuccess: () => {
      toast.success("Payment created successfully");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["student-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      handleClose();
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create payment";
      toast.error(msg);
    },
  });

  const handleClose = () => {
    reset();
    setSelectedClassId("");
    setSelectedSectionId("");
    setSelectedStudentId("");
    onClose();
  };

  const onSubmit = (data: PaymentFormData) => {
    if (!selectedSchool?.schoolId) {
      toast.error("No school selected");
      return;
    }
    createPaymentMutation.mutate({
      ...data,
      schoolId: selectedSchool.schoolId,
    });
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

  const getStatusConfig = (status: string) => {
    const configs: { [key: string]: { color: string; label: string } } = {
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Create Payment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Student Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <User className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Student Selection</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Selection */}
              <div>
                <Label htmlFor="class" className="text-sm font-medium">
                  Class <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedClassId(value);
                    setSelectedSectionId("");
                    setSelectedStudentId("");
                    setValue("studentInvoiceId", "");
                    setValue("amount", 0);
                  }}
                  value={selectedClassId}
                  disabled={classesLoading}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={
                        classesLoading ? "Loading..." : "Select class"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {classesLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading classes...
                        </div>
                      </SelectItem>
                    ) : classes?.data?.data?.length > 0 ? (
                      classes.data.data.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-classes" disabled>
                        No classes available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Selection */}
              <div>
                <Label htmlFor="section" className="text-sm font-medium">
                  Section <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedSectionId(value);
                    setSelectedStudentId("");
                    setValue("studentInvoiceId", "");
                    setValue("amount", 0);
                  }}
                  value={selectedSectionId}
                  disabled={!selectedClassId || sections.length === 0}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={
                        !selectedClassId
                          ? "Select class first"
                          : sections.length === 0
                          ? "No sections available"
                          : "Select section"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.length > 0 ? (
                      sections.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-sections" disabled>
                        No sections available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Student Selection */}
            <div>
              <Label htmlFor="student" className="text-sm font-medium">
                Student <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => {
                  setSelectedStudentId(value);
                  setValue("studentInvoiceId", "");
                  setValue("amount", 0);
                }}
                value={selectedStudentId}
                disabled={!selectedSectionId || studentsLoading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue
                    placeholder={
                      !selectedSectionId
                        ? "Select class & section first"
                        : studentsLoading
                        ? "Loading..."
                        : "Select student"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {studentsLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading students...
                      </div>
                    </SelectItem>
                  ) : students?.data?.data?.length > 0 ? (
                    students.data.data.map((student: any) => (
                      <SelectItem
                        key={student.studentId || student.id}
                        value={student.studentId || student.id}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{student.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            #{student.admission_number}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-students" disabled>
                      No students found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Invoice Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <FileText className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Invoice Selection</h3>
            </div>

            <div>
              <Label htmlFor="studentInvoiceId" className="text-sm font-medium">
                Invoice <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="studentInvoiceId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const invoice = invoices?.data?.data?.find(
                        (inv: any) => inv.id === value
                      );
                      if (invoice) {
                        setValue("amount", invoice.amountDue);
                      }
                    }}
                    value={field.value}
                    disabled={!selectedStudentId || invoicesLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue
                        placeholder={
                          !selectedStudentId
                            ? "Select student first"
                            : invoicesLoading
                            ? "Loading..."
                            : "Select invoice"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {invoicesLoading ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading invoices...
                          </div>
                        </SelectItem>
                      ) : invoices?.data?.data?.length > 0 ? (
                        invoices.data.data.map((invoice: any) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {invoice.invoice?.invoiceNumber}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {invoice.invoice?.title}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-red-600">
                                {formatCurrency(invoice.amountDue)}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-invoices" disabled>
                          No unpaid invoices found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.studentInvoiceId && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.studentInvoiceId.message}
                </p>
              )}
            </div>

            {/* Invoice Details Card */}
            {selectedInvoice && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Invoice Details
                      </span>
                      <Badge
                        className={
                          getStatusConfig(selectedInvoice.status).color
                        }
                      >
                        {getStatusConfig(selectedInvoice.status).label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Invoice #</p>
                        <p className="font-semibold">
                          {selectedInvoice.invoice?.invoiceNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Due Date</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(selectedInvoice.invoice?.dueDate || "")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Amount</p>
                        <p className="font-semibold">
                          {formatCurrency(selectedInvoice.perStudentTotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount Paid</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(selectedInvoice?.amountPaid || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Amount Due
                        </span>
                        <span className="text-lg font-bold text-red-600">
                          {formatCurrency(selectedInvoice?.amountDue || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Payment Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount Input */}
              <div>
                <Label htmlFor="amount" className="text-sm font-medium">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₦
                      </span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-8"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  )}
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.amount.message}
                  </p>
                )}
                {selectedInvoice &&
                  watch("amount") > selectedInvoice.amountDue && (
                    <p className="text-orange-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Amount exceeds balance due
                    </p>
                  )}
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="paymentMethod" className="text-sm font-medium">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PaymentMethod).map((method) => (
                          <SelectItem key={method} value={method}>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              {method.replace(/_/g, " ")}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.paymentMethod.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPaymentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPaymentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createPaymentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePaymentModal;
