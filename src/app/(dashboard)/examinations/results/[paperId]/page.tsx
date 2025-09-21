"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { useExamStore } from '@/store/examStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResultsTable } from '@/components/dashboard/examinations/ResultsTable';
import { EssayGrading } from '@/components/dashboard/examinations/EssayGrading';
import { Download } from 'lucide-react';
import { useStudentStore } from '@/store/studentStore';
import { ImportResultsDialog } from '@/components/dashboard/examinations/ImportResultsDialog';
import { Upload } from 'lucide-react';
import { saveManualResults, publishResults } from '@/services/examService';
import { toast } from 'sonner';

const ResultEntryPage = () => {
  const params = useParams();
  const paperId = params.paperId as string;
  const { selectedPaper, fetchExamPaperById, loading: examLoading, error: examError } = useExamStore();
  const { students, fetchStudentsBySection, loading: studentsLoading, error: studentsError } = useStudentStore();
  const { selectedSchool } = useAuthStore();
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [isSaving, setSaving] = useState(false);
  const [isPublishing, setPublishing] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);

  useEffect(() => {
    if (paperId) {
      fetchExamPaperById(paperId);
    }
  }, [paperId, fetchExamPaperById]);

  useEffect(() => {
    if (selectedPaper && selectedSchool && selectedPaper.sectionId) {
      fetchStudentsBySection(selectedSchool.schoolId, selectedPaper.sectionId);
    }
  }, [selectedPaper, selectedSchool, fetchStudentsBySection]);

  const handleMarksChange = (studentId: string, value: number) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSaveResults = async () => {
    setSaving(true);
    const results = Object.entries(marks).map(([studentId, marks]) => ({ studentId, marks }));
    try {
      await saveManualResults(paperId, results);
      toast.success("Results saved successfully!");
    } catch (error) {
      toast.error("Failed to save results.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishResults = async () => {
    if (!selectedPaper) return;
    setPublishing(true);
    try {
      await publishResults(paperId, !selectedPaper.published);
      toast.success(`Results ${!selectedPaper.published ? 'published' : 'unpublished'} successfully!`);
      fetchExamPaperById(paperId); // Refresh paper details
    } catch (error) {
      toast.error("Failed to update results status.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!selectedPaper) return;
    // @ts-ignore
    const response = await studentService.getSectionTermReport(selectedPaper.sectionId, selectedPaper.termId, selectedPaper.sessionId);
    const blob = new Blob([response.data as any], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_section_${selectedPaper.sectionId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const loading = examLoading || studentsLoading;
  const error = examError || studentsError;

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!selectedPaper) return <p>No exam paper found.</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Enter Results for {selectedPaper.subject.name}</CardTitle>
            <CardDescription>
              Mode: {selectedPaper.mode} | Max Marks: {selectedPaper.maxMarks}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadAll}>
              <Download className="mr-2 h-4 w-4" />
              Download All Reports
            </Button>
            {selectedPaper.mode === 'PAPER_BASED' && (
              <>
                <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Results
                </Button>
                <Button onClick={handleSaveResults} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Results"}
                </Button>
              </>
            )}
            <Button onClick={handlePublishResults} disabled={isPublishing} variant={selectedPaper.published ? "destructive" : "default"}>
              {isPublishing ? (selectedPaper.published ? 'Unpublishing...' : 'Publishing...') : (selectedPaper.published ? 'Unpublish Results' : 'Publish Results')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedPaper.mode === 'PAPER_BASED' ? (
            <ResultsTable paper={selectedPaper} students={students} onMarksChange={handleMarksChange} />
          ) : (
            <EssayGrading paperId={paperId} />
          )}
        </CardContent>
      </Card>
      <ImportResultsDialog
        isOpen={isImportDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        paperId={paperId}
      />
    </div>
  );
};

export default withAuth(ResultEntryPage, [UserRole.ADMIN, UserRole.TEACHER]);
