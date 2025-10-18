"use client";

import { useState, useEffect } from "react";
import withAuth from "@/components/withAuth";
import { useSessionStore } from "@/store/sessionStore";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/constants/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Term } from "@/services/sessionService";
import {
  getStudentExams,
  getStudentResult,
  getStudentTermReport,
} from "@/services/examService";
import { ReportModal } from "@/components/dashboard/reports/reportsModal";
import {
  FileText,
  Eye,
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const StudentResultsPage = () => {
  const { student } = useAuthStore();
  const { selectedSession } = useSessionStore();
  const [examPapers, setExamPapers] = useState<any[]>([]);
  const [groupedPapers, setGroupedPapers] = useState<Record<string, any[]>>({});
  const [openTerms, setOpenTerms] = useState<Record<string, boolean>>({});
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [reportData, setReportData] = useState<any>(null);
  const [paperResult, setPaperResult] = useState<any>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (selectedSession?.id && student?.id) {
        setLoadingPapers(true);
        try {
          const paperRes = await getStudentExams(student?.id, selectedSession.id);
          // Flatten the papers array from all exams
          const allPapers = paperRes.data?.flatMap((exam: any) => 
            exam.papers.map((paper: any) => ({
              ...paper,
              exam: {
                title: exam.title,
                status: exam.status
              },
              term: exam.term
            }))
          ) || [];
          setExamPapers(allPapers);
          
          // Group papers by term
          const grouped = allPapers.reduce((acc: Record<string, any[]>, paper: any) => {
            const termName = paper.term?.name || "Uncategorized";
            if (!acc[termName]) {
              acc[termName] = [];
            }
            acc[termName].push(paper);
            return acc;
          }, {});
          setGroupedPapers(grouped);
          
          // Initialize all terms as open by default
          const initialOpenState = Object.keys(grouped).reduce((acc, termName) => {
            acc[termName] = true;
            return acc;
          }, {} as Record<string, boolean>);
          setOpenTerms(initialOpenState);
        } catch (error) {
          toast.error("Failed to load exam papers");
        } finally {
          setLoadingPapers(false);
        }
      }
    };
    fetchInitialData();
  }, [selectedSession, student]);

  useEffect(() => {
    if (selectedSession) {
      setTerms(selectedSession.terms || []);
    }
  }, [selectedSession]);

  const toggleTerm = (termName: string) => {
    setOpenTerms(prev => ({
      ...prev,
      [termName]: !prev[termName]
    }));
  };

  const calculateGrade = (score: number, maxMarks: number) => {
    const percentage = (score / maxMarks) * 100;
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    if (percentage >= 40) return "E";
    return "F";
  };

  const handleViewPaperResult = async (paper: any) => {
    setSelectedPaper(paper);
    try {
      // Check if there are attempts for this paper
      const studentAttempt = paper.attempts?.find(
        (attempt: any) => attempt.studentId === student?.id
      );
      
      if (studentAttempt) {
        setPaperResult({
          totalScore: studentAttempt.totalScore,
          grade: calculateGrade(studentAttempt.totalScore, paper.maxMarks),
          remarks: studentAttempt.remarks || "",
        });
        setIsResultDialogOpen(true);
      } else {
        // Fallback to API results if no attempt found
        const results = await getStudentResult(paper.id);
        const studentResult = results.data.find(
          (r: any) => r.student.id === student?.id
        );
        setPaperResult(studentResult);
        setIsResultDialogOpen(true);
      }
    } catch (error) {
      toast.error("Failed to load result");
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTerm) {
      toast.error("Please select a term first");
      return;
    }

    if (selectedSession?.id && selectedTerm) {
      setLoading(true);
      try {
        const data = await getStudentTermReport(
          student?.id || "",
          selectedTerm,
          selectedSession.id
        );
        setReportData(data.data);
        setIsReportModalOpen(true);
        toast.success("Report generated successfully!");
      } catch (error) {
        toast.error("Failed to generate report");
      } finally {
        setLoading(false);
      }
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 50) return "text-blue-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-600";
      case "B":
        return "bg-blue-600";
      case "C":
        return "bg-yellow-600";
      case "D":
        return "bg-orange-600";
      case "E":
        return "bg-purple-600";
      case "F":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Award className="w-8 h-8 text-blue-600" />
            My Results
          </h1>
          <p className="text-muted-foreground mt-1">
            View your exam results and academic reports
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {selectedSession?.name}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="exam-papers" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="exam-papers" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Exam Results
          </TabsTrigger>
          <TabsTrigger value="term-report" className="gap-2">
            <FileText className="w-4 h-4" />
            Term Report
          </TabsTrigger>
        </TabsList>

        {/* Exam Papers Tab */}
        <TabsContent value="exam-papers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Published Exam Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPapers ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-muted-foreground">
                    Loading exam papers...
                  </p>
                </div>
              ) : examPapers.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-4">
                      <BookOpen className="w-10 h-10 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">
                    No exam results available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your published exam results will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPapers).map(([termName, papers]) => (
                    <Collapsible
                      key={termName}
                      open={openTerms[termName]}
                      onOpenChange={() => toggleTerm(termName)}
                    >
                      <div className="space-y-3">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center gap-2 px-2 py-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group">
                            {openTerms[termName] ? (
                              <ChevronDown className="w-5 h-5 text-blue-600 transition-transform" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-blue-600 transition-transform" />
                            )}
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">{termName}</h3>
                            <Badge variant="secondary" className="ml-auto">
                              {papers.length} {papers.length === 1 ? 'Exam' : 'Exams'}
                            </Badge>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3">
                          <div className="rounded-lg border overflow-hidden">
                            <Table>
                              <TableHeader className="bg-muted/50">
                                <TableRow>
                                  <TableHead className="w-12">#</TableHead>
                                  <TableHead>Subject</TableHead>
                                  <TableHead>Exam</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Mode</TableHead>
                                  <TableHead className="text-center">Status</TableHead>
                                  <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {papers.map((paper, index) => (
                                  <TableRow key={paper.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium text-muted-foreground">
                                      {index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      {paper.subject.name}
                                    </TableCell>
                                    <TableCell>{paper.exam?.title || "N/A"}</TableCell>
                                    <TableCell>
                                      {format(new Date(paper.startTime), "MMM dd, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          paper.mode === "CBT" ? "default" : "secondary"
                                        }
                                        className={
                                          paper.mode === "CBT"
                                            ? "bg-purple-600"
                                            : "bg-orange-100 text-orange-800"
                                        }
                                      >
                                        {paper.mode}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {paper.isResultPublished ? (
                                        <Badge variant="default" className="bg-green-600">
                                          <CheckCircle2 className="w-3 h-3 mr-1" />
                                          Published
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">
                                          <XCircle className="w-3 h-3 mr-1" />
                                          Pending
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewPaperResult(paper)}
                                        disabled={!paper.isResultPublished}
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Result
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Term Report Tab */}
        <TabsContent value="term-report">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generate Term Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Term</label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a term" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.length > 0 ? (
                        terms.map((term) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="no-term">
                          No terms available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleGenerateReport}
                    disabled={!selectedTerm || loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your term report includes all your exam
                  results, attendance, behavioral assessments, and teacher
                  comments for the selected term.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Result Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedPaper?.subject.name} - Result
            </DialogTitle>
          </DialogHeader>
          {paperResult ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Your Score
                    </p>
                    <p
                      className={`text-4xl font-bold ${getScoreColor(
                        paperResult.totalScore,
                        selectedPaper?.maxMarks || 100
                      )}`}
                    >
                      {paperResult.totalScore}
                      <span className="text-xl text-muted-foreground">
                        /{selectedPaper?.maxMarks}
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Grade</p>
                    <Badge
                      className={`text-2xl px-4 py-2 ${getGradeColor(
                        paperResult.grade
                      )}`}
                    >
                      {paperResult.grade}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Exam Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(
                        new Date(selectedPaper?.startTime || new Date()),
                        "MMM dd, yyyy"
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mode:</span>{" "}
                    <Badge variant="outline">{selectedPaper?.mode}</Badge>
                  </div>
                </div>
              </div>

              {paperResult.remarks && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Teacher&apos;s Remark</h4>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm italic">{paperResult.remarks}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsResultDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportData(null);
        }}
        reportData={reportData}
        studentName={student?.name || ""}
      />
    </div>
  );
};

export default withAuth(StudentResultsPage, [
  UserRole.STUDENT,
  UserRole.PARENT,
]);