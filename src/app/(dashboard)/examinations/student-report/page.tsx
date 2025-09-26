"use client";

import { useState, useEffect, useRef } from 'react';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSession } from 'next-auth/react';
import { useReactToPrint } from 'react-to-print';
import { classService, Class } from '@/services/classService';
import { studentService, Student } from '@/services/studentService';
import { generateStudentTermResult } from '@/services/exam.service';
import TermReport from './TermReport';
import { getSessionTerms, getActiveSession } from '@/services/session.service';
import { ITerm } from '@/types/session.type';

const StudentReportPage = () => {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [terms, setTerms] = useState<ITerm[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const reportRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (session?.user.schoolId) {
        const classRes = await classService.getClasses(session.user.schoolId);
        setClasses(classRes.data.data);

        const activeSession = await getActiveSession();
        if (activeSession) {
          const termRes = await getSessionTerms(activeSession.id);
          setTerms(termRes.data);
        }
      }
    };
    fetchInitialData();
  }, [session]);

  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    setLoading(true);
    if(session?.user.schoolId) {
        const studentRes = await studentService.getStudentsBySchool(session.user.schoolId, { classId });
        setStudents(studentRes.data.data);
    }
    setLoading(false);
  };

  const handleGenerateReport = async (studentId: string) => {
    if (session?.user.sessionId && selectedTerm) {
      setLoading(true);
      const data = await generateStudentTermResult(studentId, selectedTerm, session.user.sessionId);
      setReportData(data.data);
      setLoading(false);
    } else {
        alert("Please select a term.");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate Student Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Select onValueChange={handleClassChange} value={selectedClass}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedTerm} value={selectedTerm}>
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

          {loading && <p>Loading...</p>}

          {!loading && students.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Admission Number</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleGenerateReport(student.id)}>View Report</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {reportData && (
        <div ref={reportRef} className="mt-8">
            <TermReport reportData={reportData} onPrint={handlePrint} />
        </div>
      )}
    </div>
  );
};

export default withAuth(StudentReportPage, [UserRole.ADMIN, UserRole.TEACHER]);