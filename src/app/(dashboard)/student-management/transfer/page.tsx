"use client";

import { useEffect, useState } from "react";
import withAuth from "@/components/withAuth";
import { UserRole, ADMINS_ROLES } from "@/constants/roles";
import { useAuth } from "@/store/authStore";
import { classService, Class, ClassSection } from "@/services/classService";
import { studentService } from "@/services/studentService";
import { Student } from "@/types/student";
import { schoolService, School } from "@/services/schoolService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TransferStudentPage = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [fromClassId, setFromClassId] = useState<string>('');
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [fromSectionId, setFromSectionId] = useState<string>('');

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [schools, setSchools] = useState<School[]>([]);
  const [toSchoolId, setToSchoolId] = useState<string>('');
  const [toClasses, setToClasses] = useState<Class[]>([]);
  const [toClassId, setToClassId] = useState<string>('');
  const [toSections, setToSections] = useState<ClassSection[]>([]);
  const [toSectionId, setToSectionId] = useState<string>('');
  const [transferReason, setTransferReason] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.schoolId) {
      classService.getClasses(user.schoolId).then(res => setClasses(res.data.data));
      schoolService.getAllSchools({ limit: 1000 }).then(res => setSchools(res.data.data));
    }
  }, [user?.schoolId]);

  useEffect(() => {
    const selectedClass = classes.find(c => c.id === fromClassId);
    setSections(selectedClass?.sections || []);
    setFromSectionId('');
  }, [fromClassId, classes]);

  useEffect(() => {
    if (toSchoolId) {
      classService.getClasses(toSchoolId).then(res => setToClasses(res.data.data));
    } else {
      setToClasses([]);
    }
    setToClassId('');
    setToSectionId('');
  }, [toSchoolId]);

  useEffect(() => {
    const selectedClass = toClasses.find(c => c.id === toClassId);
    setToSections(selectedClass?.sections || []);
    setToSectionId('');
  }, [toClassId, toClasses]);

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

  const handleTransfer = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to transfer.");
      return;
    }
    if (!toSchoolId || !toClassId || !toSectionId) {
      toast.error("Please select a destination school, class, and section.");
      return;
    }

    setIsLoading(true);
    try {
      await studentService.transferStudents({
        studentIds: selectedStudents,
        toSchoolId,
        toClassId,
        toSectionId,
        transferReason,
      });
      toast.success("Students transferred successfully!");
      setStudents([]);
      setSelectedStudents([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to transfer students.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Transfer Students</h1>

      <Card>
        <CardHeader><CardTitle>Select Students to Transfer</CardTitle></CardHeader>
        <CardContent className="flex space-x-4">
          <Select onValueChange={setFromClassId} value={fromClassId}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Current Class" /></SelectTrigger>
            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={setFromSectionId} value={fromSectionId} disabled={!fromClassId}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Current Section" /></SelectTrigger>
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
                  if (checked) setSelectedStudents(students.map(s => s.id));
                  else setSelectedStudents([]);
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
        <CardContent className="flex flex-wrap gap-4">
          <Select onValueChange={setToSchoolId} value={toSchoolId}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="To School" /></SelectTrigger>
            <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={setToClassId} value={toClassId} disabled={!toSchoolId}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="To Class" /></SelectTrigger>
            <SelectContent>{toClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={setToSectionId} value={toSectionId} disabled={!toClassId}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="To Section" /></SelectTrigger>
            <SelectContent>{toSections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input
            className="w-full"
            placeholder="Transfer Reason (optional)"
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
          />
        </CardContent>
      </Card>

      <Button onClick={handleTransfer} disabled={isLoading || selectedStudents.length === 0}>
        {isLoading ? "Transferring..." : `Transfer ${selectedStudents.length} Student(s)`}
      </Button>
    </div>
  );
};

export default withAuth(TransferStudentPage, ADMINS_ROLES);
