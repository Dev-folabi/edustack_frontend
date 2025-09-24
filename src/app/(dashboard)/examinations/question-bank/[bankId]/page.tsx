"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useQuestionBankStore } from "@/store/questionBankStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, BookOpen } from "lucide-react";
import { QuestionsTable } from "@/components/dashboard/examinations/QuestionsTable";
import { AddEditQuestionDialog } from "@/components/dashboard/examinations/AddEditQuestionDialog";
import { ImportQuestionsDialog } from "@/components/dashboard/examinations/ImportQuestionsDialog";
import { BackButton } from "@/components/ui/BackButton";

const QuestionBankDetailsPage = () => {
  const params = useParams();
  const bankId = params.bankId as string;
  const { selectedQuestionBank, fetchQuestionBankById, loading, error } =
    useQuestionBankStore();
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
 

  useEffect(() => {
    if (bankId) {
      fetchQuestionBankById(bankId);
    }
  }, [bankId, fetchQuestionBankById]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-1/3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse mb-4" />
            <div className="h-6 w-1/2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
          </div>

          {/* Main Content Skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="space-y-6">
              <div className="h-6 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
              <div className="h-6 w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
              <div className="h-6 w-5/6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <Button
            onClick={() => fetchQuestionBankById(bankId)}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </Button>
        </div>
      </div>
    );

  if (!selectedQuestionBank)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Question Bank Empty
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Start building your question repository by adding questions or
            importing from existing sources.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setAddEditDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(true)}
              className="border-2 border-blue-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-full font-semibold transition-all duration-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <BackButton /> {/* Use the new BackButton component */}
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {selectedQuestionBank.name}
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
                    {selectedQuestionBank.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => setImportDialogOpen(true)}
                  className="bg-white/80 backdrop-blur-sm border-2 border-indigo-200 hover:border-indigo-300 
                   text-indigo-600 hover:bg-indigo-50 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-semibold 
                   shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Import
                </Button>
                <Button
                  onClick={() => setAddEditDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-500 
                   hover:from-blue-600 hover:via-indigo-600 hover:to-indigo-600 
                   text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-semibold shadow-lg 
                   hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Question
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                    Question Repository
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Manage and organize your question collection
                  </p>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
                    Subject: {selectedQuestionBank.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Responsive scrollable table */}
            <div className=" max-h-[70vh] rounded-lg border">
              <QuestionsTable
                questions={selectedQuestionBank.questions || []}
                bankId={bankId}
              />
            </div>
          </div>
        </div>
      </div>

      <AddEditQuestionDialog
        isOpen={isAddEditDialogOpen}
        onClose={() => setAddEditDialogOpen(false)}
        bankId={bankId}
      />
      <ImportQuestionsDialog
        isOpen={isImportDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        bankId={bankId}
      />
    </>
  );
};

export default withAuth(QuestionBankDetailsPage, [
  UserRole.ADMIN,
  UserRole.TEACHER,
]);
