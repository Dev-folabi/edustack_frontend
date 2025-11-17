"use client";

import { ColumnDef } from "@tanstack/react-table";

export interface Invoice {
  id: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  dueDate: string;
}

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
  },
  {
    accessorKey: "paidAmount",
    header: "Paid Amount",
  },
  {
    accessorKey: "balance",
    header: "Balance",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
  },
];
