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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const PromoteStudentPage = () => {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<Class[]>([]);
  const [fromClassId, setFromClassId] = useState<string>('');
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [fromSectionId, setFromSectionId] = useState<string>('');

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [toSessionId, setToSessionId] = useState<string>('');
  const [toClassId, setToClassId] = useState<string>('');
  const [toSectionId, setToSectionId] = useState<string>('');
  const [toSections, setToSections] = useState<ClassSection[]>([]);

  const [isGraduate, setIsGraduate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.schoolId) {
      classService.getClasses(user.schoolId).then(res => setClasses(res.data.data));
      sessionService.getSessions().then(res => setSessions(res.data.data));
    }
  }, [user?.schoolId]);

  useEffect(() => {
    const selectedClass = classes.find(c => c.id === fromClassId);
    setSections(selectedClass?.sections || []);
    setFromSectionId('');
  }, [fromClassId, classes]);

  useEffect(() => {
    const selectedClass = classes.find(c => c.id === toClassId);
    setToSections(selectedClass?.sections || []);
    setToSectionId('');
  }, [toClassId, classes]);

  useEffect(() => {
    if (fromSectionId && user?.schoolId) {
      studentService.getStudentsBySection(user.schoolId, fromSectionId)
        .then(res => setStudents(res.data.data))
        .catch(() => setStudents([]));
    } else {
      setStudents([]);
    }
    setSelectedStudents([]);
  }, [fromSectionId, user?.schoolId]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handlePromote = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to promote.");
      return;
    }
    if (!isGraduate && (!toClassId || !toSectionId || !toSessionId)) {
      toast.error("Please select a destination class, section, and session.");
      return;
    }

    setIsLoading(true);
    try {
      await studentService.promoteStudents({
        studentIds: selectedStudents,
        fromClassId: fromClassId,
        toClassId: isGraduate ? '' : toClassId,
        sectionId: isGraduate ? '' : toSectionId,
        promoteSessionId: toSessionId,
        isGraduate: isGraduate,
      });
      toast.success("Students promoted successfully!");
      setStudents([]);
      setSelectedStudents([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to promote students.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Promote Students</h1>

      <Card>
        <CardHeader><CardTitle>Select Students</CardTitle></CardHeader>
        <CardContent className="flex space-x-4">
          <Select onValueChange={setFromClassId} value={fromClassId}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select From Class" /></SelectTrigger>
            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={setFromSectionId} value={fromSectionId} disabled={!fromClassId}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Section" /></SelectTrigger>
            <SelectContent>{sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Student List</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead><Checkbox onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedStudents(students.map(s => s.id));
                  } else {
                    setSelectedStudents([]);
                  }
              }} /></TableHead><TableHead>Name</TableHead><TableHead>Admission No</TableHead></TableRow></TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell><Checkbox checked={selectedStudents.includes(student.id)} onCheckedChange={() => handleSelectStudent(student.id)} /></TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.admission_number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Select Destination</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="graduate-switch" checked={isGraduate} onCheckedChange={setIsGraduate} />
            <Label htmlFor="graduate-switch">Mark as Graduate</Label>
          </div>
          {!isGraduate && (
            <div className="flex space-x-4">
              <Select onValueChange={setToSessionId} value={toSessionId}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="To Session" /></SelectTrigger>
                <SelectContent>{sessions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={setToClassId} value={toClassId}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="To Class" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={setToSectionId} value={toSectionId} disabled={!toClassId}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="To Section" /></SelectTrigger>
                <SelectContent>{toSections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handlePromote} disabled={isLoading || selectedStudents.length === 0}>
        {isLoading ? "Promoting..." : `Promote ${selectedStudents.length} Student(s)`}
      </Button>
    </div>
  );
};

export default withAuth(PromoteStudentPage, [UserRole.ADMIN]);
