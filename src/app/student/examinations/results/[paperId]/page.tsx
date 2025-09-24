"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { useStudentExamStore } from '@/store/studentExamStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ViewResultPage = () => {
  const params = useParams();
  const paperId = params.paperId as string;
  const { currentResult, fetchStudentResult, loading, error } = useStudentExamStore();

  useEffect(() => {
    if (paperId) {
      fetchStudentResult(paperId);
    }
  }, [paperId, fetchStudentResult]);

  if (loading) return <p>Loading result...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!currentResult) return <p>Result not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Result for {currentResult.examPaper.subject.name}</CardTitle>
          <CardDescription>
            Your Score: <Badge className="text-lg">{currentResult.score}</Badge>
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Answer Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {currentResult.questions.map((q, index) => (
            <div key={q.id} className="mb-4 pb-4 border-b">
              <p><strong>Q{index + 1}:</strong> {q.questionText}</p>
              <p>Your Answer: {q.studentAnswer}</p>
              <p>Correct Answer: {q.correctAnswer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default withAuth(ViewResultPage, [UserRole.STUDENT, UserRole.PARENT]);
