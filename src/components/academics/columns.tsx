"use client";

import { ColumnDef } from "@tanstack/react-table";

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export const columns: ColumnDef<Subject>[] = [
  {
    accessorKey: "name",
    header: "Subject Name",
  },
  {
    accessorKey: "code",
    header: "Subject Code",
  },
];
