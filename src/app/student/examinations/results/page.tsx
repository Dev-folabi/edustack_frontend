"use client";

import { useState, useEffect, useRef } from 'react';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReactToPrint } from 'react-to-print';
import TermReport from '@/components/dashboard/reports/TermReport';

const StudentResultsPage = () => {
  const { data: session } = useSession();
  const [examPapers, setExamPapers] = useState<IExamPaper[]>([]);
  const [terms, setTerms] = useState<ITerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [paperResults, setPaperResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const reportRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (session?.user.sessionId) {
        const paperRes = await getStudentExamPapers(session.user.sessionId);
        setExamPapers(paperRes.data);
      }
      const activeSession = await getActiveSession();
      if (activeSession) {
        const termRes = await getSessionTerms(activeSession.id);
        setTerms(termRes.data);
      }
    };
    fetchInitialData();
  }, [session]);

  const handleViewPaperResult = async (paperId: string) => {
    const results = await getStudentResults(paperId);
    setPaperResults(results.data.find((r: any) => r.student.id === session?.user.studentId));
  };

  const handleGenerateReport = async () => {
    if (session?.user.studentId && session?.user.sessionId && selectedTerm) {
      setLoading(true);
      const data = await generateStudentTermResult(session.user.studentId, selectedTerm, session.user.sessionId);
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
      <Tabs defaultValue="exam-papers">
        <TabsList>
          <TabsTrigger value="exam-papers">Exam Paper Result</TabsTrigger>
          <TabsTrigger value="term-report">Term Report</TabsTrigger>
        </TabsList>

        <TabsContent value="exam-papers">
          <Card>
            <CardHeader>
              <CardTitle>Exam Paper Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examPapers.map((paper) => (
                    <TableRow key={paper.id}>
                      <TableCell>{paper.subjectId}</TableCell>
                      <TableCell>{new Date(paper.startTime).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleViewPaperResult(paper.id)}>View</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Result for {paper.subjectId}</DialogTitle>
                            </DialogHeader>
                            {paperResults ? (
                                <div>
                                    <p><strong>Score:</strong> {paperResults.totalScore}</p>
                                    <p><strong>Remarks:</strong> {paperResults.remarks}</p>
                                </div>
                            ) : <p>Loading...</p>}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="term-report">
          <Card>
            <CardHeader>
              <CardTitle>Term Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
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
                <Button onClick={handleGenerateReport}>Generate Report</Button>
              </div>

              {loading && <p>Loading report...</p>}

              {reportData && (
                <div ref={reportRef} className="mt-8">
                  <TermReport reportData={reportData} onPrint={handlePrint} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(StudentResultsPage, [UserRole.STUDENT]);