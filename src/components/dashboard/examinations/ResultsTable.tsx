"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { studentService } from '@/services/studentService';
import { toast } from 'sonner';
import { ExamPaper } from '@/types/exam';

interface ResultsTableProps {
  paper: ExamPaper;
  students: Student[];
  onMarksChange: (studentId: string, marks: number) => void;
}

export const ResultsTable = ({ paper, students, onMarksChange }: ResultsTableProps) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleDownload = async (studentId: string) => {
    setLoading(prev => ({ ...prev, [studentId]: true }));
    try {
      if (!paper.termId || !paper.sessionId) {
        toast.error("Cannot download report: term or session ID is missing.");
        return;
      }
      const response = await studentService.getStudentTermReport(studentId, paper.termId, paper.sessionId);
      const blob = new Blob([response.data as any], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${studentId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download report.");
    } finally {
      setLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Admission No.</TableHead>
            <TableHead>Marks</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.admissionNumber}</TableCell>
              <TableCell>
                {paper.mode === 'PAPER_BASED' ? (
                  <Input
                    type="number"
                    className="w-24"
                    onChange={(e) => onMarksChange(student.id, Number(e.target.value))}
                  />
                ) : (
                  <span>{/* Auto-graded score will go here */}</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleDownload(student.id)} disabled={loading[student.id]}>
                  <Download className="mr-2 h-4 w-4" />
                  {loading[student.id] ? 'Downloading...' : 'Report'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
