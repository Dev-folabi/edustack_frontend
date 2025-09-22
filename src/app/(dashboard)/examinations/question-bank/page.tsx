"use client";

import { useState } from "react";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { QuestionBankTable } from "@/components/dashboard/examinations/QuestionBankTable";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle } from "lucide-react";
import { CreateEditQuestionBankDialog } from "@/components/dashboard/examinations/CreateEditQuestionBankDialog";

const QuestionBankPage = () => {
  const [isCreateEditDialogOpen, setCreateEditDialogOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-blue-600" />
                Question Bank
              </h1>
              <p className="text-gray-600">
                Create and manage question banks for your subjects.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={() => setCreateEditDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Question Bank
              </Button>
            </div>
          </div>

          {/* Question Banks Table */}
          <QuestionBankTable />
        </div>
      </div>
      <CreateEditQuestionBankDialog
        isOpen={isCreateEditDialogOpen}
        onClose={() => setCreateEditDialogOpen(false)}
      />
    </>
  );
};

export default withAuth(QuestionBankPage, [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.TEACHER,
]);
