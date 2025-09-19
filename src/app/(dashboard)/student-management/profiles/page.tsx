"use client";

import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { StudentTable } from "@/components/dashboard/student-management/StudentTable";
import { Button } from "@/components/ui/button";
import { Download, Printer, Plus, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClassStore } from "@/store/classStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

const StudentProfilesPage = () => {
  const router = useRouter();
  const { selectedSchool } = useAuthStore();
  const { fetchClasses, classes } = useClassStore();

  useEffect(() => {
    if (selectedSchool?.schoolId) {
      fetchClasses(selectedSchool.schoolId);
    }
  }, [selectedSchool?.schoolId]);

  const handleAddNewStudent = () => {
    router.push("/student-management/add-student");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              Student Management
            </h1>
            <p className="text-gray-600">
              Manage and view all students in your school system
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button 
              variant="outline" 
              className="bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button 
              variant="outline"
              className="bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print List
            </Button>
            <Button 
              onClick={handleAddNewStudent}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Student
            </Button>
          </div>
        </div>

        {/* Student Table */}
        <StudentTable classes={classes} />
      </div>
    </div>
  );
};

export default withAuth(StudentProfilesPage, [
  UserRole.ADMIN,
  UserRole.TEACHER,
]);
