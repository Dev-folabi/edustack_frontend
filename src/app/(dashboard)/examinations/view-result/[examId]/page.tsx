"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getExamById, getStudentResults } from '@/services/exam.service';
import { IExam, IExamPaper } from '@/types/exam.type';

interface IStudentResult {
  id: string;
  student: {
    id: string;
    name: string;
  };
  totalScore: number;
  remarks: string;
}

const ViewResultPage = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState<IExam | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [results, setResults] = useState<IStudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    const fetchExamDetails = async () => {
      if (typeof examId === 'string') {
        const examDetails = await getExamById(examId);
        setExam(examDetails);
      }
      setLoading(false);
    };
    fetchExamDetails();
  }, [examId]);

  const handlePaperChange = async (paperId: string) => {
    setSelectedPaper(paperId);
    setResultsLoading(true);
    const studentResults = await getStudentResults(paperId);
    setResults(studentResults.data);
    setResultsLoading(false);
  };

  if (loading) return <p>Loading exam details...</p>;
  if (!exam) return <p>Exam not found.</p>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>View Results for: {exam.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select onValueChange={handlePaperChange} value={selectedPaper}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select an exam paper" />
              </SelectTrigger>
              <SelectContent>
                {exam.papers.map((paper: IExamPaper) => (
                  <SelectItem key={paper.id} value={paper.id}>
                    {paper.subjectId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {resultsLoading ? (
            <p>Loading results...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.student.name}</TableCell>
                    <TableCell>{result.totalScore}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">View</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Result for {result.student.name}</DialogTitle>
                          </DialogHeader>
                          <div>
                            <p><strong>Score:</strong> {result.totalScore}</p>
                            <p><strong>Remarks:</strong> {result.remarks}</p>
                          </div>
                        </DialogContent>
                      </Dialog>
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

export default withAuth(ViewResultPage, [UserRole.ADMIN, UserRole.TEACHER]);