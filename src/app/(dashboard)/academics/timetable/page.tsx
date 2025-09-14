"use client";

import React from "react";
import withAuth from "@/components/withAuth";
import { STAFF_ROLES, UserRole } from "@/constants/roles";
import TimetableToolbar from "@/components/dashboard/timetable/TimetableToolbar";
import TimetableGrid from "@/components/dashboard/timetable/TimetableGrid";
import CreateEditEntryModal from "@/components/dashboard/timetable/CreateEditEntryModal";

const TimetablePage = () => {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Timetable Management</h1>
      <TimetableToolbar />
      <TimetableGrid />
      <CreateEditEntryModal />
    </div>
  );
};

export default withAuth(TimetablePage, [
  ...STAFF_ROLES,
  UserRole.STUDENT,
  UserRole.PARENT,
]);
