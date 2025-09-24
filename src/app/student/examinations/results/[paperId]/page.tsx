"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { getTermReportByPaper } from '@/services/examService';
import { ReportCard } from '@/components/student-dashboard/ReportCard';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { toast } from 'sonner';

const StudentResultPage = () => {
  const params = useParams();
  const paperId = params.paperId as string;

  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paperId) {
      const fetchReport = async () => {
        try {
          setLoading(true);
          setError(null);
          // The function getTermReportByPaper already uses the paperId to fetch the report
          const response = await getTermReportByPaper(paperId);
          if (response.success) {
            setReportData(response.data);
          } else {
            setError(response.message || 'Failed to fetch report data.');
          }
        } catch (err) {
            setError('An unexpected error occurred while fetching the report.');
        } finally {
          setLoading(false);
        }
      };
      fetchReport();
    }
  }, [paperId]);

  const handleExport = async () => {
    const reportCardElement = document.getElementById('report-card');
    if (!reportCardElement) {
      toast.error("Could not find report card element to export.");
      return;
    }

    toast.info("Generating PDF... Please wait.");

    try {
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = (await import('jspdf'));

        const canvas = await html2canvas(reportCardElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        const studentName = reportData?.student?.name || 'student';
        const term = reportData?.term || 'report';
        pdf.save(`Report-Card-${studentName.replace(' ', '-')}-${term.replace(' ', '-')}.pdf`);

        toast.success("PDF downloaded successfully!");
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast.error("An error occurred while generating the PDF.");
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <BackButton />
                {reportData && (
                    <Button onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export to PDF
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-96"><p>Loading Report...</p></div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-96 text-red-500">
                    <AlertTriangle className="h-12 w-12 mb-4"/>
                    <p className="text-xl font-semibold">Could not load report</p>
                    <p>{error}</p>
                </div>
            ) : reportData ? (
                <ReportCard data={reportData} />
            ) : (
                <div className="flex justify-center items-center h-96"><p>No report data available for this paper.</p></div>
            )}
        </div>
    </div>
  );
};

export default withAuth(StudentResultPage, [UserRole.STUDENT, UserRole.PARENT]);
