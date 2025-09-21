"use client";

import { useState } from "react";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { ExamTable } from "@/components/dashboard/examinations/ExamTable";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { CreateExamDialog } from "@/components/dashboard/examinations/CreateExamDialog";

const ManageExamsPage = () => {
  const [isCreateExamOpen, setCreateExamOpen] = useState(false);

  const handleAddNewExam = () => {
    setCreateExamOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                Manage Exams
              </h1>
              <p className="text-gray-600">
                Create, view, and manage all exams in your school.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={handleAddNewExam}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Exam
              </Button>
            </div>
          </div>

          {/* Exams Table */}
          <ExamTable />
        </div>
      </div>
      <CreateExamDialog isOpen={isCreateExamOpen} onClose={() => setCreateExamOpen(false)} />
    </>
  );
};

export default withAuth(ManageExamsPage, [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.TEACHER,
]);
