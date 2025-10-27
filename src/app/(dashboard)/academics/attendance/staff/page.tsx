"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import withAuth from "@/components/withAuth";
import { useAuthStore } from "@/store/authStore";
import { STAFF_ROLES, ADMINS_ROLES } from "@/constants/roles";

import TakeStaffAttendanceForm from "@/components/dashboard/academics/attendance/TakeStaffAttendanceForm";
import ViewStaffAttendance from "@/components/dashboard/academics/attendance/ViewStaffAttendance";

const StaffAttendancePage = () => {
  const { selectedSchool } = useAuthStore();
  const canTakeAttendance = ADMINS_ROLES.some((role) =>
    selectedSchool?.role?.includes(role)
  );

  // Determine the default tab based on the user's role
  const defaultTab = canTakeAttendance ? "take-attendance" : "view-records";

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Staff Attendance</h1>
      <Tabs defaultValue={defaultTab}>
        <TabsList
          className={`grid w-full ${
            canTakeAttendance ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {canTakeAttendance && (
            <TabsTrigger value="take-attendance">Take Attendance</TabsTrigger>
          )}
          <TabsTrigger value="view-records">View Records</TabsTrigger>
        </TabsList>
        {canTakeAttendance && (
          <TabsContent value="take-attendance">
            <Card>
              <CardHeader>
                <CardTitle>Take Staff Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <TakeStaffAttendanceForm />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        <TabsContent value="view-records">
          <Card>
            <CardHeader>
              <CardTitle>View Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <ViewStaffAttendance />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(StaffAttendancePage, STAFF_ROLES);
