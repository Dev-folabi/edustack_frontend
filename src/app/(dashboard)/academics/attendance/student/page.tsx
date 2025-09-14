'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';

import TakeStudentAttendanceForm from '@/components/dashboard/academics/attendance/TakeStudentAttendanceForm';

import ViewStudentAttendance from '@/components/dashboard/academics/attendance/ViewStudentAttendance';

const StudentAttendancePage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Attendance</h1>
      <Tabs defaultValue="take-attendance">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="take-attendance">Take Attendance</TabsTrigger>
          <TabsTrigger value="view-records">View Records</TabsTrigger>
        </TabsList>
        <TabsContent value="take-attendance">
          <Card>
            <CardHeader>
              <CardTitle>Take Student Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <TakeStudentAttendanceForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="view-records">
          <ViewStudentAttendance />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(StudentAttendancePage, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER]);
