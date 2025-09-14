'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { useAuthStore } from '@/store/authStore'; // Keep this for the type

import TakeStaffAttendanceForm from '@/components/dashboard/academics/attendance/TakeStaffAttendanceForm';
import ViewStaffAttendance from '@/components/dashboard/academics/attendance/ViewStaffAttendance';

const StaffAttendancePage = ({ user }: { user: any }) => {
  const canTakeAttendance = user?.roles.includes(UserRole.ADMIN) || user?.roles.includes(UserRole.SUPER_ADMIN);
  const isStaff = user?.roles.includes(UserRole.STAFF);

  // Determine the default tab based on the user's role
  const defaultTab = canTakeAttendance ? "take-attendance" : "view-records";

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Staff Attendance</h1>
      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-2">
          {canTakeAttendance && <TabsTrigger value="take-attendance">Take Attendance</TabsTrigger>}
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
              <ViewStaffAttendance user={user} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(StaffAttendancePage, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF]);
