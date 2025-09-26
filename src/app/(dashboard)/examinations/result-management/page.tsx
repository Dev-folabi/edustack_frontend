"use client";

import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getActiveSession, getSessionTerms } from '@/services/session.service';
import { getExams } from '@/services/exam.service';
import { ITerm } from '@/types/session.type';
import { IExam } from '@/types/exam.type';

const ResultManagementPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [terms, setTerms] = useState<ITerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [exams, setExams] = useState<IExam[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTerms = async () => {
      if (session?.user.schoolId) {
        const activeSession = await getActiveSession();
        if (activeSession) {
          const sessionTerms = await getSessionTerms(active_session.id);
          setTerms(sessionTerms.data);
        }
      }
    };
    fetchTerms();
  }, [session]);

  const handleTermChange = async (termId: string) => {
    setSelectedTerm(termId);
    setLoading(true);
    if (session?.user.schoolId && session?.user.sessionId) {
      const fetchedExams = await getExams({
        schoolId: session.user.schoolId,
        termId,
        sessionId: session.user.sessionId,
      });
      setExams(fetchedExams.data);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Result Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select onValueChange={handleTermChange} value={selectedTerm}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <p>Loading exams...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{exam.title}</TableCell>
                    <TableCell>{new Date(exam.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(exam.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/examinations/add-result/${exam.id}`)}
                        className="mr-2"
                      >
                        Add Result
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => router.push(`/dashboard/examinations/view-result/${exam.id}`)}
                      >
                        View Result
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default withAuth(ResultManagementPage, [UserRole.ADMIN, UserRole.TEACHER]);