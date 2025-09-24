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
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Question Bank
                </h1>
              </div>
              <p className="text-gray-600 text-sm lg:text-base">
                Manage your question bank efficiently. Create, update, and
                delete questions with ease.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setCreateEditDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Question Bank
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <QuestionBankTable />
          </div>
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
