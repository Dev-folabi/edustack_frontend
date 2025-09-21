"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { useQuestionBankStore } from '@/store/questionBankStore';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { QuestionsTable } from '@/components/dashboard/examinations/QuestionsTable';
import { AddEditQuestionDialog } from '@/components/dashboard/examinations/AddEditQuestionDialog';
import { ImportQuestionsDialog } from '@/components/dashboard/examinations/ImportQuestionsDialog';

const QuestionBankDetailsPage = () => {
  const params = useParams();
  const bankId = params.bankId as string;
  const { selectedQuestionBank, fetchQuestionBankById, loading, error } = useQuestionBankStore();
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);

  useEffect(() => {
    if (bankId) {
      fetchQuestionBankById(bankId);
    }
  }, [bankId, fetchQuestionBankById]);

  if (loading) return <p>Loading question bank details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!selectedQuestionBank) return <p>No question bank found.</p>;

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedQuestionBank.name}</CardTitle>
              <CardDescription>{selectedQuestionBank.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import Questions
              </Button>
              <Button onClick={() => setAddEditDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-gray-500">Subject: {selectedQuestionBank.subjectId}</p>
          </CardContent>
        </Card>

        <QuestionsTable questions={selectedQuestionBank.questions || []} bankId={bankId} />
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

export default withAuth(QuestionBankDetailsPage, [UserRole.ADMIN, UserRole.TEACHER]);
