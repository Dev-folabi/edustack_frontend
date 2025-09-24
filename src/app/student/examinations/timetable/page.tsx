"use client";

import { useEffect, useState } from 'react';
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { getStudentExamTimetable } from '@/services/examService';
import { ExamPaper } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

const StudentExamTimetablePage = () => {
  const [timetable, setTimetable] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const response = await getStudentExamTimetable();
        if (response.success) {
          // Sort papers by date
          const sortedPapers = response.data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          setTimetable(sortedPapers);
        } else {
          setError(response.message || 'Failed to fetch timetable.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <CalendarDays className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-800">Exam Timetable</h1>
            </div>
            <BackButton />
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Upcoming Exam Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading timetable...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : timetable.length === 0 ? (
            <p>No exams scheduled in your timetable yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Paper</TableHead>
                  <TableHead>Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetable.map((paper) => (
                  <TableRow key={paper.id}>
                    <TableCell>{new Date(paper.paperDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(paper.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(paper.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell>{paper.subject.name}</TableCell>
                    <TableCell>{paper.title || 'Main Paper'}</TableCell>
                    <TableCell>{paper.mode}</TableCell>
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

export default withAuth(StudentExamTimetablePage, [UserRole.STUDENT, UserRole.PARENT]);
