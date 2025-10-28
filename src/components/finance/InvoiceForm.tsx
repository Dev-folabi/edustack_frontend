// src/components/finance/InvoiceForm.tsx
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FeeCategory, Invoice } from "@/services/financeService";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  allowPartialPayment: z.boolean(),
  assignmentType: z.enum(["SINGLE_STUDENT", "CLASS", "SECTION"]),
  studentIds: z.array(z.string()).optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  items: z.array(
    z.object({
      feeCategoryId: z.string().min(1, { message: "Fee category is required" }),
      amount: z.coerce.number().min(0, { message: "Amount must be positive" }),
    })
  ),
});

interface InvoiceFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
  initialData?: Invoice;
  feeCategories: FeeCategory[];
}

const InvoiceForm = ({
  onSubmit,
  isLoading,
  initialData,
  feeCategories,
}: InvoiceFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      dueDate: initialData?.dueDate || "",
      allowPartialPayment: true,
      assignmentType: "SINGLE_STUDENT",
      studentIds: [],
      items: [{ feeCategoryId: "", amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Form fields for title, description, dueDate, etc. */}
        {/* ... */}

        <div>
          <h3>Invoice Items</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name={`items.${index}.feeCategoryId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a fee category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {feeCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.amount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="destructive" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ feeCategoryId: "", amount: 0 })}
          >
            Add Item
          </Button>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Invoice"}
        </Button>
      </form>
    </Form>
  );
};

export default InvoiceForm;
