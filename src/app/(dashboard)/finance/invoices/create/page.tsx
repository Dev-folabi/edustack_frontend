"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";
import { useClassStore } from "@/store/classStore";
import { useSessionStore } from "@/store/sessionStore";
import { financeService } from "@/services/financeService";
import { studentService } from "@/services/studentService";
import { FeeCategory } from "@/types/finance";
import { Student } from "@/types/student";
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
import { Trash2, Plus } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { BackButton } from "@/components/ui/BackButton";

const invoiceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  allowPartialPayment: z.boolean(),
  assignmentType: z.enum([
    "SINGLE_STUDENT",
    "MULTIPLE_STUDENTS",
    "CLASS",
    "SECTION",
  ]),
  termId: z.string().min(1, "Term is required"),
  studentIds: z.array(z.string()).optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  items: z
    .array(
      z.object({
        feeCategoryId: z.string().min(1, "Fee category is required"),
        amount: z.number().min(0.01, "Amount must be greater than 0"),
      })
    )
    .min(1, "At least one item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const CreateInvoicePage = () => {
  const router = useRouter();
  const { selectedSchool } = useAuthStore();
  const { classes, fetchClasses } = useClassStore();
  const { terms, fetchTerms, selectedSession } = useSessionStore();
  const { showToast } = useToast();

  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      allowPartialPayment: true,
      items: [{ feeCategoryId: "", amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const assignmentType = watch("assignmentType");

  useEffect(() => {
    if (selectedSchool?.schoolId) {
      fetchClasses(selectedSchool.schoolId);
      financeService
        .getFeeCategories(selectedSchool.schoolId, 1, 100)
        .then((res) => setFeeCategories(res.data?.data ?? []));
      studentService
        .getStudentsBySchool(selectedSchool.schoolId, { limit: 1000 })
        .then((res) => setStudents(res.data?.data ?? []));
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (selectedSession) {
      fetchTerms(selectedSession.id, selectedSchool?.schoolId || "");
    }
  }, [selectedSession]);

  const onSubmit = async (data: InvoiceFormData) => {
    if (!selectedSchool?.schoolId) return;

    const payload = {
      ...data,
      schoolId: selectedSchool.schoolId,
      sessionId: selectedSession!.id,
    };

    try {
      await financeService.createInvoice(payload);
      showToast({
        type: "success",
        title: "Success",
        message: "Invoice created successfully",
      });
      router.push("/finance/fee-management");
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to create invoice",
      });
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BackButton />
            <CardTitle>Create Invoice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-red-500 text-sm">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="termId">Term</Label>
                <Controller
                  control={control}
                  name="termId"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a term" />
                      </SelectTrigger>
                      <SelectContent>
                        {terms.map((term) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.termId && (
                  <p className="text-red-500 text-sm">
                    {errors.termId.message}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowPartialPayment"
                  {...register("allowPartialPayment")}
                />
                <Label htmlFor="allowPartialPayment">
                  Allow Partial Payment
                </Label>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Invoice Items</h3>
              {fields.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 mb-2">
                  <Controller
                    control={control}
                    name={`items.${index}.feeCategoryId`}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee category" />
                        </SelectTrigger>
                        <SelectContent>
                          {feeCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    type="number"
                    {...register(`items.${index}.amount`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Amount"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => append({ feeCategoryId: "", amount: 0 })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
              {errors.items && (
                <p className="text-red-500 text-sm">{errors.items.message}</p>
              )}
            </div>

            {/* Assignment */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Assign Invoice</h3>
              <Controller
                control={control}
                name="assignmentType"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE_STUDENT">
                        Single Student
                      </SelectItem>
                      <SelectItem value="MULTIPLE_STUDENTS">
                        Multiple Students
                      </SelectItem>
                      <SelectItem value="CLASS">Entire Class</SelectItem>
                      <SelectItem value="SECTION">Entire Section</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assignmentType && (
                <p className="text-red-500 text-sm">
                  {errors.assignmentType.message}
                </p>
              )}

              {assignmentType === "SINGLE_STUDENT" && (
                <div className="mt-4">
                  <Label>Select Student</Label>
                  <Controller
                    control={control}
                    name="studentIds"
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => field.onChange([value])}
                        defaultValue={field.value?.[0]}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((s) => (
                            <SelectItem
                              key={s.studentId}
                              value={s.studentId || ""}
                            >
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              {assignmentType === "MULTIPLE_STUDENTS" && (
                <div className="mt-4">
                  <Label>Select Students</Label>
                  <Controller
                    control={control}
                    name="studentIds"
                    render={({ field }) => (
                      <MultiSelect
                        options={students.map((s) => ({
                          label: s.name,
                          value: s.studentId || "",
                        }))}
                        defaultValue={field.value || []}
                        onValueChange={field.onChange}
                        placeholder="Select students"
                      />
                    )}
                  />
                </div>
              )}

              {assignmentType === "CLASS" && (
                <div className="mt-4">
                  <Label>Select Class</Label>
                  <Controller
                    control={control}
                    name="classId"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              {assignmentType === "SECTION" && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label>Select Class</Label>
                    <Controller
                      control={control}
                      name="classId"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label>Select Section</Label>
                    <Controller
                      control={control}
                      name="sectionId"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!watch("classId")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a section" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes
                              .find((c) => c.id === watch("classId"))
                              ?.sections.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit">Create Invoice</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default withAuth(CreateInvoicePage, [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.FINANCE,
]);
