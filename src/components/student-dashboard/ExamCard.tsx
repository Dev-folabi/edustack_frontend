"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExamPaper } from '@/types/exam';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, Pencil, FileText } from 'lucide-react';

interface ExamCardProps {
  paper: ExamPaper;
  status: 'upcoming' | 'ongoing' | 'completed' | 'published';
}

const StatusInfo = ({ status, paper }) => {
  const commonClasses = "flex items-center gap-2 text-sm";
  switch (status) {
    case 'upcoming':
      return <p className={`${commonClasses} text-blue-600`}><Clock className="h-4 w-4" /> Starts on {new Date(paper.startTime).toLocaleDateString()}</p>;
    case 'ongoing':
      return <p className={`${commonClasses} text-green-600`}><Pencil className="h-4 w-4" /> Ongoing</p>;
    case 'completed':
      return <p className={`${commonClasses} text-gray-600`}><CheckCircle className="h-4 w-4" /> Completed</p>;
    case 'published':
      return <p className={`${commonClasses} text-purple-600`}><FileText className="h-4 w-4" /> Result Published</p>;
    default:
      return null;
  }
};

const ActionButton = ({ status, paper }) => {
    const router = useRouter();

    const handleAction = () => {
        if (status === 'upcoming' || status === 'ongoing') {
            router.push(`/student/examinations/attempt/${paper.id}`);
        } else if (status === 'published') {
            router.push(`/student/examinations/results/${paper.id}`);
        }
    };

    switch (status) {
        case 'upcoming':
            return <Button variant="outline" onClick={handleAction}>View Details</Button>;
        case 'ongoing':
            return <Button onClick={handleAction}>Start / Continue</Button>;
        case 'completed':
            return <Button variant="secondary" disabled>Awaiting Results</Button>;
        case 'published':
            return <Button variant="success" onClick={handleAction}>View Result</Button>;
        default:
            return null;
    }
};

export const ExamCard = ({ paper, status }: ExamCardProps) => {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-lg">{paper.title || paper.subject.name}</CardTitle>
        <StatusInfo status={status} paper={paper} />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{paper.subject.name}</p>
            <Badge variant={paper.mode === 'CBT' ? 'default' : 'secondary'}>{paper.mode}</Badge>
        </div>
        <div className="text-sm mt-2">
            <p><strong>Marks:</strong> {paper.maxMarks}</p>
            <p><strong>Duration:</strong> {`${(new Date(paper.endTime).getTime() - new Date(paper.startTime).getTime()) / 60000} minutes`}</p>
        </div>
      </CardContent>
      <CardFooter>
        <ActionButton status={status} paper={paper} />
      </CardFooter>
    </Card>
  );
};
