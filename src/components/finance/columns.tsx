"use client";

import { ColumnDef } from "@tanstack/react-table";

export interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionRef: string;
  createdAt: string;
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "transactionRef",
    header: "Transaction Reference",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
];
