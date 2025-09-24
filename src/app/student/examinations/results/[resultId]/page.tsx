"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { examinationService } from '@/services/examinationService';
import { ExamResult } from '@/types/examination';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { Loader } from '@/components/ui/Loader';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import ResultHeader from '@/components/student-dashboard/results/ResultHeader';
import AcademicPerformanceTable from '@/components/student-dashboard/results/AcademicPerformanceTable';
import PsychomotorSkills from '@/components/student-dashboard/results/PsychomotorSkills';
import Remarks from '@/components/student-dashboard/results/Remarks';
import GradingScale from '@/components/student-dashboard/results/GradingScale';

const StudentResultPage = () => {
  const params = useParams();
  const { resultId } = params;
  const { toast } = useToast();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    const fetchResult = async () => {
      // The resultId is a composite key: studentId-termId-sessionId
      const [studentId, termId, sessionId] = (resultId as string).split('-');

      if (!studentId || !termId || !sessionId) {
          toast({ title: "Error", description: "Invalid result URL.", variant: "destructive" });
          setIsLoading(false);
          return;
      }

      try {
        const response = await examinationService.getStudentTermReport(studentId, termId, sessionId);
        if (response.success) {
          setResult(response.data);
        } else {
          toast({ title: "Error", description: "Failed to fetch result.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "An error occurred while fetching the result.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    if (resultId) {
      fetchResult();
    }
  }, [resultId, toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader /></div>;
  }

  if (!result) {
    return <div className="text-center p-8 text-red-500 font-semibold">Result not found for the specified parameters.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 print:bg-white">
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Result</Button>
      </div>
      <div ref={componentRef} className="bg-white p-8 rounded-lg shadow-lg printable-area">
        <ResultHeader schoolName="Greenfield Academy" schoolAddress="123 Education Lane, Knowledge City" />
        <div className="grid grid-cols-3 gap-x-6 gap-y-2 my-6 border-y py-4">
            <div><strong>Name:</strong> {result.student.name}</div>
            <div><strong>Class:</strong> {result.student.class}</div>
            <div><strong>Admission No:</strong> {result.student.admission_number}</div>
            <div><strong>Term:</strong> {result.term}</div>
            <div><strong>Session:</strong> {result.session}</div>
        </div>
        <AcademicPerformanceTable results={result.results} />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <PsychomotorSkills skills={result.psychomotor} />
          <GradingScale />
        </div>
        <Remarks teacher={result.remarks.teacher} principal={result.remarks.principal} />
        <div className="mt-12 text-xs text-center text-gray-500">
            This is an electronically generated report and does not require a signature.
        </div>
      </div>
    </div>
  );
};

export default withAuth(StudentResultPage, [UserRole.STUDENT, UserRole.PARENT]);
