"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import withAuth from "@/components/withAuth";
import { STAFF_ROLES, UserRole } from "@/constants/roles";
import TimetableToolbar from "@/components/dashboard/timetable/TimetableToolbar";
import TimetableList from "@/components/dashboard/timetable/TimetableList";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/utils/permissions";
import { useTimetableStore } from "@/store/timetableStore";
import { useAuthStore } from "@/store/authStore";
import { Plus } from "lucide-react";

const TimetablePage = () => {
  const { schoolTimetables, isLoading, fetchSchoolTimetables } =
    useTimetableStore();

  const { selectedSchool } = useAuthStore();
  const { hasRole } = usePermissions();
  const canCreate = hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN);

 const schoolId = selectedSchool?.schoolId || null;

  useEffect(() => {
    if (schoolId) {
      fetchSchoolTimetables(schoolId);
    }
  }, [schoolId, fetchSchoolTimetables]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Timetables</h1>
        {canCreate && (
          <Button asChild>
            <Link href="/academics/timetable/create">
              <Plus className="h-4 w-4 mr-2" />
              Create New Timetable
            </Link>
          </Button>
        )}
      </div>

      {/* Quick Access - View Timetable by Section */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          Quick Access - View Timetable by Section
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Select a class and section to quickly view its timetable.
        </p>
        <TimetableToolbar />
      </div>

      {/* All School Timetables */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">All School Timetables</h2>
        <p className="text-sm text-gray-600 mb-4">
          View and manage all timetables for your school. Click &quot;View&quot;
          to see the detailed timetable or &quot;Edit&quot; to modify.
        </p>
        <TimetableList timetables={schoolTimetables} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default withAuth(TimetablePage, STAFF_ROLES);
