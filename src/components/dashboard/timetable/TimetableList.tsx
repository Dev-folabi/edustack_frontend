"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Timetable, TimetableStatus } from "@/services/timetableService";

interface TimetableListProps {
  timetables: Timetable[];
  isLoading: boolean;
}

const TimetableList = ({ timetables, isLoading }: TimetableListProps) => {
  const router = useRouter();

  const handleEdit = (timetableId: string) => {
    router.push(`/academics/timetable/edit/${timetableId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (timetables.length === 0) {
    console.log({timetables})
    return (
      <div className="text-center text-gray-500 py-8">
        No timetables found for this school.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timetables.map((timetable) => (
            <TableRow key={timetable.id}>
              <TableCell>{timetable.section.class.name}</TableCell>
              <TableCell>{timetable.section.name}</TableCell>
              <TableCell>{timetable.term?.name || "N/A"}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    timetable.status === TimetableStatus.PUBLISHED
                      ? "default"
                      : "secondary"
                  }
                >
                  {timetable.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(timetable.id)}
                >
                  View / Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TimetableList;
