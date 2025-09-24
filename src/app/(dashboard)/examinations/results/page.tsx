"use client";

import { useState, useEffect } from 'react';
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useSessionStore } from '@/store/sessionStore';
import { useClassStore } from '@/store/classStore';
import { useAuthStore } from '@/store/authStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookCopy } from 'lucide-react';
import { getExamPapers } from '@/services/examService';
import { ExamPaper } from '@/types/exam';
import { ExamPaperList } from '@/components/dashboard/examinations/ExamPaperList';

const ResultsPage = () => {
  const { selectedSchool } = useAuthStore();
  const { sessions, fetchSessions, terms, fetchTerms } = useSessionStore();
  const { classes, fetchClasses } = useClassStore();

  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSchool) {
      fetchSessions();
      fetchClasses(selectedSchool.schoolId);
    }
  }, [selectedSchool, fetchSessions, fetchClasses]);

  useEffect(() => {
    if (selectedSession) {
      fetchTerms(selectedSession);
    }
  }, [selectedSession, fetchTerms]);

  const sections = classes.find(c => c.id === selectedClass)?.sections || [];

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getExamPapers({ termId: selectedTerm, sectionId: selectedSection });
      if (response.success) {
        setExamPapers(response.data);
      }
    } catch (err) {
      setError('Failed to fetch exam papers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BookCopy className="w-8 h-8 text-blue-600" />
            View Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select onValueChange={setSelectedSession}>
              <SelectTrigger>
                <SelectValue placeholder="Select Session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedTerm} disabled={!selectedSession}>
              <SelectTrigger>
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedSection} disabled={!selectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSearch} disabled={!selectedSection || !selectedTerm || loading}>
              {loading ? 'Searching...' : 'Search Results'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-red-500">{error}</p>}
      <ExamPaperList papers={examPapers} />
    </div>
  );
};

export default withAuth(ResultsPage, [UserRole.ADMIN, UserRole.TEACHER]);
