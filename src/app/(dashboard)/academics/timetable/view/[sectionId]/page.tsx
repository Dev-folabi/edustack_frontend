"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import { STAFF_ROLES, UserRole } from "@/constants/roles";
import TimetableGrid from "@/components/dashboard/timetable/TimetableGrid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTimetableStore } from "@/store/timetableStore";
import { useAuthStore } from "@/store/authStore";
import { useClassStore } from "@/store/classStore";
import { Skeleton } from "@/components/ui/skeleton";

const ViewTimetablePage = () => {
  const params = useParams();
  const router = useRouter();
  const sectionId = params.sectionId as string;

  const { selectedTimetable, isLoading, fetchClassTimetable } = useTimetableStore();
  const { selectedSchool } = useAuthStore();
  const { classes, fetchClasses } = useClassStore();
  const schoolId = selectedSchool?.schoolId;

  useEffect(() => {
    if (sectionId) {
      fetchClassTimetable(sectionId);
    }
  }, [sectionId, fetchClassTimetable]);

  useEffect(() => {
    if (schoolId) {
      fetchClasses(schoolId);
    }
  }, [schoolId, fetchClasses]);

  const getClassName = (classId: string) => {
    const classInfo = classes.find((c) => c.id === classId);
    return classInfo?.name || "";
  };

  const handleBack = () => {
    router.push("/academics/timetable");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Timetables
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {selectedTimetable
              ? `Timetable for ${getClassName(selectedTimetable.classId)} - ${selectedTimetable.section.name}`
              : "Timetable View"}
          </h1>
          {selectedTimetable && (
            <div className="text-sm text-gray-600 mt-1">
              <span>Class: {getClassName(selectedTimetable.classId)}</span>
              <span className="mx-2">•</span>
              <span>Section: {selectedTimetable.section.name}</span>
              <span className="mx-2">•</span>
              <span>Session: {selectedTimetable.session.name}</span>
              {selectedTimetable.term && (
                <>
                  <span className="mx-2">•</span>
                  <span>Term: {selectedTimetable.term.name}</span>
                </>
              )}
            </div>
          )}
          <p className="text-gray-500">{selectedTimetable?.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <TimetableGrid sectionId={sectionId} />
      </div>
    </div>
  );
};

export default withAuth(ViewTimetablePage, [
  ...STAFF_ROLES,
  UserRole.STUDENT,
  UserRole.PARENT,
]);
