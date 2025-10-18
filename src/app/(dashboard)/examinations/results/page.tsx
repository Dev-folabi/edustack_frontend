"use client";

import { useState, useEffect } from "react";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useSessionStore } from "@/store/sessionStore";
import { useClassStore } from "@/store/classStore";
import { useAuthStore } from "@/store/authStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookCopy, Search, Filter, X } from "lucide-react";
import { getExamPapers } from "@/services/examService";
import { ExamPaper } from "@/types/exam";
import { ExamPaperList } from "@/components/dashboard/examinations/ExamPaperList";
import { Badge } from "@/components/ui/badge";

const ResultsPage = () => {
  const { selectedSchool } = useAuthStore();
  const { selectedSession } = useSessionStore();
  const { classes, fetchClasses } = useClassStore();

  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchSubject, setSearchSubject] = useState("");
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSchool) {
      fetchClasses(selectedSchool.schoolId);
    }
  }, [selectedSchool, fetchClasses]);

  useEffect(() => {
    // Filter papers by subject search
    if (searchSubject.trim()) {
      const filtered = examPapers.filter((paper) =>
        paper.subject.name.toLowerCase().includes(searchSubject.toLowerCase()) ||
        paper.subject.code.toLowerCase().includes(searchSubject.toLowerCase())
      );
      setFilteredPapers(filtered);
    } else {
      setFilteredPapers(examPapers);
    }
  }, [searchSubject, examPapers]);

  const sections = classes.find((c) => c.id === selectedClass)?.sections || [];
  const terms = selectedSession?.terms;

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getExamPapers({
        schoolId: selectedSchool?.schoolId || "",
        termId: selectedTerm,
        sectionId: selectedSection,
      });
      if (response.success) {
        setExamPapers(response.data);
        setFilteredPapers(response.data);
      }
    } catch (err) {
      setError("Failed to fetch exam papers.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedTerm("");
    setSelectedClass("");
    setSelectedSection("");
    setSearchSubject("");
    setExamPapers([]);
    setFilteredPapers([]);
  };

  const hasFilters = selectedTerm || selectedClass || selectedSection;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookCopy className="w-8 h-8 text-blue-600" />
            Exam Results
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage examination results
          </p>
        </div>
        {examPapers.length > 0 && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            {filteredPapers.length} Result{filteredPapers.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Results
            </CardTitle>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Session</label>
              <Select value={selectedSession?.id} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={selectedSession?.id || ""}>
                    {selectedSession?.name}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm} disabled={!selectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  {terms?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Section</label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSearch}
              disabled={!selectedSection || !selectedTerm || loading}
              size="lg"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Searching..." : "Search Results"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subject Search */}
      {examPapers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by subject name or code..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      <ExamPaperList papers={filteredPapers} />
    </div>
  );
};

export default withAuth(ResultsPage, [UserRole.ADMIN, UserRole.TEACHER]);