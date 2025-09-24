"use client";

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Exam, ExamStatus } from '@/types/examination';
import { Clock, Book, Calendar, CheckCircle, FileText } from 'lucide-react';
import useAuthStore from '@/store/authStore';

interface ExamCardProps {
  exam: Exam;
}

const ExamCard = ({ exam }: ExamCardProps) => {
  const { user } = useAuthStore();
  const studentId = user?.student?.id;

  const getAction = () => {
    switch (exam.status) {
      case ExamStatus.ONGOING:
        // Assuming the first paper is the one to be taken
        return (
          <Link href={`/student/examinations/cbt/${exam.papers[0]?.id}`} passHref>
            <Button>Start Exam</Button>
          </Link>
        );
      case ExamStatus.COMPLETED:
        return <Button disabled>View Details</Button>;
      case ExamStatus.RESULT_PUBLISHED:
        return (
          <Link href={`/student/examinations/results/${studentId}-${exam.termId}-${exam.sessionId}`} passHref>
            <Button>View Result</Button>
          </Link>
        );
      case ExamStatus.UPCOMING:
      default:
        return <Button disabled>View Details</Button>;
    }
  };

  const getStatusBadge = () => {
    switch (exam.status) {
      case ExamStatus.ONGOING:
        return <Badge variant="destructive">Ongoing</Badge>;
      case ExamStatus.COMPLETED:
        return <Badge variant="default">Completed</Badge>;
      case ExamStatus.RESULT_PUBLISHED:
        return <Badge variant="success">Published</Badge>;
      case ExamStatus.UPCOMING:
      default:
        return <Badge variant="secondary">Upcoming</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span className="font-bold text-lg">{exam.title}</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {exam.papers.map(paper => (
            <div key={paper.id} className="flex items-center text-sm text-muted-foreground">
              <Book className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>{paper.subject.name}</span>
            </div>
          ))}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{new Date(exam.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{new Date(exam.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(exam.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {getAction()}
      </CardFooter>
    </Card>
  );
};

export default ExamCard;
