"use client";

import { useRouter } from 'next/navigation';
import { ExamPaper } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExamPaperListProps {
  papers: ExamPaper[];
}

export const ExamPaperList = ({ papers }: ExamPaperListProps) => {
  const router = useRouter();

  const handleManageResults = (paperId: string) => {
    router.push(`/examinations/results/${paperId}`);
  };

  if (papers.length === 0) {
    return <p>No exam papers found for the selected criteria.</p>;
  }

  return (
    <div className="space-y-4">
      {papers.map(paper => (
        <Card key={paper.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{paper.subject.name}</span>
              <Button onClick={() => handleManageResults(paper.id)}>Manage Results</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <p><strong>Date:</strong> {new Date(paper.startTime).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(paper.startTime).toLocaleTimeString()}</p>
            </div>
            <Badge>{paper.mode}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
