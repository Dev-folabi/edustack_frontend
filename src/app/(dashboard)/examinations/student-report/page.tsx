"use client";

import { useState, useEffect } from "react";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { classService, Class, ClassSection } from "@/services/classService";
import { studentService } from "@/services/studentService";
import { Student } from "@/types/student";
import { Term } from "@/services/sessionService";
import { useAuthStore } from "@/store/authStore";
import { useSessionStore } from "@/store/sessionStore";
import { getStudentTermReport } from "@/services/examService";
import { FileText, Users, Filter, Eye, Loader2 } from "lucide-react";
import { ReportModal } from "@/components/dashboard/reports/reportsModal";
import { useToast } from "@/components/ui/Toast";

const StudentReportPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [terms, setTerms] = useState<Term[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { showToast } = useToast();

  const { selectedSession } = useSessionStore();
  const { selectedSchool } = useAuthStore();

  useEffect(() => {
    const fetchInitialData = async () => {
      if (selectedSchool?.schoolId) {
        const classRes = await classService.getClasses(selectedSchool.schoolId);
        setClasses(classRes?.data?.data || []);

        if (selectedSession) {
          setTerms(selectedSession.terms || []);
        }
      }
    };
    fetchInitialData();
  }, [selectedSchool?.schoolId, selectedSession]);

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    const classObj = classes.find((c) => c.id === classId);
    setSections(classObj?.sections || []);
    setStudents([]);
    setSelectedSection("");
  };

  const handleSectionChange = async (sectionId: string) => {
    setSelectedSection(sectionId);
    setLoadingStudents(true);
    try {
      if (selectedSchool?.schoolId) {
        const studentRes = await studentService.getStudentsBySchool(
          selectedSchool.schoolId,
          { sectionId }
        );
        setStudents(studentRes?.data?.data || []);
      }
    } catch (error) {
      showToast({
        title: "Error",
        message: "Failed to load students",
        type: "error",
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleGenerateReport = async (student: Student) => {
    if (!selectedTerm) {
      showToast({
        title: "Error",
        message: "Please select a term first",
        type: "error",
      });
      return;
    }

    if (selectedSession?.id && selectedTerm) {
      setLoading(true);
      setSelectedStudent(student);
      try {
        const data = await getStudentTermReport(
          student?.studentId || "",
          selectedTerm,
          selectedSession.id
        );
        setReportData(data.data);
        setIsModalOpen(true);
        showToast({
          title: "Success",
          message: "Report generated successfully!",
          type: "success",
        });
      } catch (error) {
        showToast({
          title: "Error",
          message: "Failed to generate report",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const hasFilters = selectedClass && selectedSection && selectedTerm;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Student Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and view student term reports
          </p>
        </div>
        {students.length > 0 && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            {students.length} Student{students.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Select Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Session */}
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

            {/* Term */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Term *</label>
              <Select
                value={selectedTerm}
                onValueChange={setSelectedTerm}
                disabled={!selectedSession}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Term" />
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

            {/* Class */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Class *</label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.length > 0 ? (
                    classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="no-class">
                      No classes available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Section *</label>
              <Select
                value={selectedSection}
                onValueChange={handleSectionChange}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.length > 0 ? (
                    sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="no-section">
                      No sections available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!hasFilters && (
            <p className="text-sm text-muted-foreground mt-4">
              * Please select term, class, and section to view students
            </p>
          )}
        </CardContent>
      </Card>

      {/* Students Table */}
      {loadingStudents ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          </CardContent>
        </Card>
      ) : students.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Students List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Admission Number</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.name || "N/A"}
                      </TableCell>
                      <TableCell>{student.admissionNumber || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {student.gender || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          onClick={() => handleGenerateReport(student)}
                          disabled={loading}
                          size="sm"
                        >
                          {loading && selectedStudent?.id === student.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              View Report
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : hasFilters ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-4">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                No students found
              </p>
              <p className="text-sm text-muted-foreground">
                No students are enrolled in the selected section
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Report Modal */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReportData(null);
          setSelectedStudent(null);
        }}
        reportData={reportData}
        studentName={selectedStudent?.name || ""}
      />
    </div>
  );
};

export default withAuth(StudentReportPage, [UserRole.ADMIN, UserRole.TEACHER]);
