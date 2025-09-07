import React from 'react';
import StudentSidebar from '@/components/student-dashboard/StudentSidebar';

const StudentDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <StudentSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-4 md:px-6 py-8 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;
