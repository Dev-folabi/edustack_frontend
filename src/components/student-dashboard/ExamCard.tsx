"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExamPaper } from '@/types/exam';
import { useRouter } from 'next/navigation';
import { startExam } from '@/services/examService';
import { toast } from 'sonner';
import { useState } from 'react';

interface ExamCardProps {
  paper: ExamPaper;
  status: 'upcoming' | 'ongoing' | 'completed' | 'published';
}

export const ExamCard = ({ paper, status }: ExamCardProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (status === 'ongoing') {
      setLoading(true);
      try {
        const response = await startExam(paper.id);
        if (response.success) {
          router.push(`/student/examinations/cbt/${response.data.attemptId}`);
        } else {
          toast.error(response.message || "Failed to start exam.");
        }
      } catch (error) {
        toast.error("An error occurred while starting the exam.");
      } finally {
        setLoading(false);
      }
    } else if (status === 'published') {
      router.push(`/student/examinations/results/${paper.id}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{paper.subject.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Date:</strong> {new Date(paper.startTime).toLocaleDateString()}</p>
        <p><strong>Time:</strong> {new Date(paper.startTime).toLocaleTimeString()}</p>
        <Badge>{paper.mode}</Badge>
      </CardContent>
      <CardFooter>
        {status === 'ongoing' && <Button onClick={handleAction} disabled={loading}>{loading ? "Starting..." : "Start Exam"}</Button>}
        {status === 'published' && <Button onClick={handleAction}>View Result</Button>}
      </CardFooter>
    </Card>
  );
};
