"use client";

import React, { useEffect } from "react";
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
import { useClassStore } from "@/store/classStore";
import { useAuthStore } from "@/store/authStore";

interface TimetableListProps {
  timetables: Timetable[];
  isLoading: boolean;
}

const TimetableList = ({ timetables, isLoading }: TimetableListProps) => {
  const router = useRouter();
  const { classes, fetchClasses } = useClassStore();
  const { selectedSchool } = useAuthStore();

  useEffect(() => {
    if (selectedSchool?.schoolId) {
      fetchClasses(selectedSchool.schoolId);
    }
  }, [selectedSchool?.schoolId]);

  const getClassName = (classId: string) => {
    const classInfo = classes.find((c) => c.id === classId);
    return classInfo?.name || "N/A";
  };

  const handleView = (sectionId: string) => {
    router.push(`/academics/timetable/view/${sectionId}`);
  };

  const handleEdit = (timetableId: string) => {
    router.push(`/academics/timetable/edit/${timetableId}`);
  };

  if (isLoading) {
    console.log({ load: timetables });
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  if (!timetables || timetables.length === 0) {
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
              <TableCell>{getClassName(timetable.classId)}</TableCell>
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
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(timetable.sectionId)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(timetable.id)}
                >
                  Edit
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
