"use client";

import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { StudentTable } from "@/components/dashboard/student-management/StudentTable";
import { Button } from "@/components/ui/button";
import { Download, Printer, Plus } from "lucide-react";
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
    <div className="space-y-6">
      {/* ## Responsive Page Header ## */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Active Students</h1>
          <p className="text-muted-foreground">
            Manage and view all active students in the system.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleAddNewStudent} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add New Student
          </Button>
        </div>
      </div>

      <StudentTable classes={classes} />
    </div>
  );
};

export default withAuth(StudentProfilesPage, [
  UserRole.ADMIN,
  UserRole.TEACHER,
]);
