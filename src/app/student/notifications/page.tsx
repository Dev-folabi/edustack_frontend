"use client";

import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';

const StudentNotificationsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p>This page will display all notifications for the student/parent. This page is under construction.</p>
    </div>
  );
};

export default withAuth(StudentNotificationsPage, [UserRole.STUDENT, UserRole.PARENT]);
