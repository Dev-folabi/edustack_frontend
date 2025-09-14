"use client";

import React from "react";
import Link from "next/link";
import withAuth from "@/components/withAuth";
import { STAFF_ROLES, UserRole } from "@/constants/roles";
import TimetableToolbar from "@/components/dashboard/timetable/TimetableToolbar";
import TimetableGrid from "@/components/dashboard/timetable/TimetableGrid";
import TimetableList from "@/components/dashboard/timetable/TimetableList";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/utils/permissions";
import { useTimetableStore } from "@/store/timetableStore";
import { useAuthStore } from "@/store/authStore";

const TimetablePage = () => {
  const { schoolTimetables, isLoading, fetchSchoolTimetables } = useTimetableStore();
  const { selectedSchool } = useAuthStore();
  const { hasRole } = usePermissions();
  const canCreate = hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN);

  useEffect(() => {
    if (selectedSchool) {
      fetchSchoolTimetables(selectedSchool.schoolId);
    }
  }, [selectedSchool, fetchSchoolTimetables]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Timetable Management</h1>
        {canCreate && (
          <Button asChild>
            <Link href="/academics/timetable/create">Create New Timetable</Link>
          </Button>
        )}
      </div>

      {/* View Timetable by Section */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">View Timetable by Section</h2>
        <TimetableToolbar />
        <div className="mt-4">
          <TimetableGrid />
        </div>
      </div>

      {/* All School Timetables */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">All School Timetables</h2>
        <TimetableList timetables={schoolTimetables} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default withAuth(TimetablePage, [
  ...STAFF_ROLES,
  UserRole.STUDENT,
  UserRole.PARENT,
]);
