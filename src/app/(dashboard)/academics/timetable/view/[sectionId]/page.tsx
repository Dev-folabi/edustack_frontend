"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import withAuth from "@/components/withAuth";
import { STAFF_ROLES, UserRole } from "@/constants/roles";
import TimetableGrid from "@/components/dashboard/timetable/TimetableGrid";
import { useTimetableStore } from "@/store/timetableStore";
import { useAuthStore } from "@/store/authStore";
import { useClassStore } from "@/store/classStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ViewTimetablePage = () => {
  const { sectionId } = useParams();
  const { fetchClassTimetable, selectedTimetable } = useTimetableStore();
  const { selectedSchool } = useAuthStore();
  const { classes, fetchClasses } = useClassStore();

  useEffect(() => {
    if (sectionId) {
      fetchClassTimetable(sectionId as string);
    }
    if (selectedSchool) {
      fetchClasses(selectedSchool.schoolId);
    }
  }, [sectionId, fetchClassTimetable, selectedSchool, fetchClasses]);

  const getClassName = (classId: string) => {
    const classInfo = classes.find((c) => c.id === classId);
    return classInfo?.name || "";
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Button variant="outline" asChild>
            <Link href="/academics/timetable"> Back to Timetables</Link>
          </Button>
          <h1 className="text-2xl font-bold mt-4">
            {selectedTimetable
              ? `Timetable for ${getClassName(
                  selectedTimetable.classId
                )} - ${selectedTimetable.section.name}`
              : "Timetable"}
          </h1>
          <p className="text-gray-500">{selectedTimetable?.name}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <TimetableGrid />
      </div>
    </div>
  );
};

export default withAuth(ViewTimetablePage, [
  ...STAFF_ROLES,
  UserRole.STUDENT,
  UserRole.PARENT,
]);
