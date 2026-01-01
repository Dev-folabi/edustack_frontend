"use client";

import { useEffect, useState } from "react";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";
import { classService, Class, ClassSection } from "@/services/classService";
import { studentService } from "@/services/studentService";
import { Student } from "@/types/student";
import { sessionService, Session } from "@/services/sessionService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";

interface Term {
  id: string;
  name: string;
  sessionId: string;
  start_date: string;
  end_date: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SessionWithTerms extends Session {
  terms: Term[];
}

const PromoteStudentPage = () => {
  const { selectedSchool } = useAuthStore();
  const { showToast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [fromClassId, setFromClassId] = useState("");
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [fromSectionId, setFromSectionId] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [sessions, setSessions] = useState<SessionWithTerms[]>([]);
  const [toSessionId, setToSessionId] = useState("");
  const [toClassId, setToClassId] = useState("");
  const [toSectionId, setToSectionId] = useState("");
  const [toSections, setToSections] = useState<ClassSection[]>([]);
  const [promoteTermId, setPromoteTermId] = useState("");
  const [availableTerms, setAvailableTerms] = useState<Term[]>([]);

  const [isGraduate, setIsGraduate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedSchool?.schoolId) {
      classService
        .getClasses(selectedSchool.schoolId)
        .then((res) => setClasses(res.data?.data ?? []));
      sessionService
        .getSessions(selectedSchool.schoolId)
        .then((res) =>
          setSessions((res?.data?.data ?? []) as SessionWithTerms[])
        );
    }
  }, [selectedSchool?.schoolId]);

  useEffect(() => {
    const selectedClass = classes.find((c) => c.id === fromClassId);
    setSections(selectedClass?.sections || []);
    setFromSectionId("");
  }, [fromClassId, classes]);

  useEffect(() => {
    const selectedClass = classes.find((c) => c.id === toClassId);
    setToSections(selectedClass?.sections || []);
    setToSectionId("");
  }, [toClassId, classes]);

  useEffect(() => {
    if (toSessionId) {
      const selectedSession = sessions.find((s) => s.id === toSessionId);
      setAvailableTerms(selectedSession?.terms || []);
      setPromoteTermId("");
    } else {
      setAvailableTerms([]);
    }
  }, [toSessionId, sessions]);

  useEffect(() => {
    if (fromSectionId && selectedSchool?.schoolId) {
      studentService
        .getStudentsBySection(selectedSchool.schoolId, {
          sectionId: fromSectionId,
        })
        .then((res) => setStudents(res.data?.data ?? []))
        .catch(() => setStudents([]));
    } else {
      setStudents([]);
    }
    setSelectedStudents([]);
  }, [fromSectionId, selectedSchool?.schoolId]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handlePromote = async () => {
    if (selectedStudents.length === 0) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please select at least one student to promote.",
      });
      return;
    }
    if (
      !isGraduate &&
      (!toClassId || !toSectionId || !toSessionId || !promoteTermId)
    ) {
      showToast({
        type: "error",
        message:
          "Please select a destination class, section, session, and term.",
        title: "Error",
      });
      return;
    }

    setIsLoading(true);
    try {
      await studentService.promoteStudents({
        studentIds: selectedStudents,
        fromClassId: fromClassId,
        toClassId: isGraduate ? "" : toClassId,
        sectionId: isGraduate ? "" : toSectionId,
        promoteSessionId: toSessionId,
        promoteTermId: promoteTermId,
        isGraduate: isGraduate,
      });
      showToast({
        type: "success",
        title: "Success",
        message: "Students promoted successfully!",
      });
      setStudents([]);
      setSelectedStudents([]);
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to promote students.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6 space-y-8">
      {/* Page header */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Promote Students
        </h1>
        <p className="text-sm text-muted-foreground">
          Move students to a new class or mark them as graduates.
        </p>
      </div>

      {/* Step 1: Source */}
      <Card className="shadow-sm border rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Filter Students</CardTitle>
          <CardDescription>
            Select the class and section to filter students.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select onValueChange={setFromClassId} value={fromClassId}>
            <SelectTrigger className="w-full">
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

          <Select
            onValueChange={setFromSectionId}
            value={fromSectionId}
            disabled={!fromClassId}
          >
            <SelectTrigger className="w-full">
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
        </CardContent>
      </Card>

      {/* Step 2: Student List */}
      {students.length > 0 && (
        <Card className="shadow-sm border rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Students</CardTitle>
            <CardDescription>Choose which students to promote.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      onCheckedChange={(checked) =>
                        checked
                          ? setSelectedStudents(students.map((s) => s.id ?? ""))
                          : setSelectedStudents([])
                      }
                      checked={
                        selectedStudents.length === students.length &&
                        students.length > 0
                      }
                    />
                  </TableHead>
                  <TableHead className="text-left">Name</TableHead>
                  <TableHead className="text-left">Admission No.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow
                    key={student.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(
                          student.studentId ?? ""
                        )}
                        onCheckedChange={() =>
                          handleSelectStudent(student.studentId ?? "")
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.admissionNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Destination */}
      <Card className="shadow-sm border rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Promotion Details
          </CardTitle>
          <CardDescription>
            Choose the destination or mark as graduated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="graduate-switch"
              checked={isGraduate}
              onCheckedChange={setIsGraduate}
            />
            <Label htmlFor="graduate-switch">Mark as Graduate</Label>
          </div>

          {!isGraduate && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Select onValueChange={setToSessionId} value={toSessionId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setToClassId} value={toClassId}>
                <SelectTrigger className="w-full">
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

              <Select
                onValueChange={setToSectionId}
                value={toSectionId}
                disabled={!toClassId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {toSections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={setPromoteTermId}
                value={promoteTermId}
                disabled={!toSessionId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  {availableTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Action */}
      <div className="flex justify-end">
        <Button
          size="lg"
          className="w-full sm:w-auto"
          onClick={handlePromote}
          disabled={isLoading || selectedStudents.length === 0}
        >
          {isLoading
            ? "Promoting..."
            : `Promote ${selectedStudents.length} Student${
                selectedStudents.length > 1 ? "s" : ""
              }`}
        </Button>
      </div>
    </div>
  );
};

export default withAuth(PromoteStudentPage, [UserRole.ADMIN, UserRole.TEACHER]);
