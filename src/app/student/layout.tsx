import React from 'react';

// These components will be created in the next steps
// import StudentHeader from '@/components/student-dashboard/StudentHeader';
// import StudentSidebar from '@/components/student-dashboard/StudentSidebar';

const StudentDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* <StudentSidebar /> */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <StudentHeader /> */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;
