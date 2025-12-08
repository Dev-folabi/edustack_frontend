"use client";

import { useEffect, useState } from "react";
import withAuth from "@/components/withAuth";
import { ADMINS_ROLES } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";
import { classService, Class, ClassSection } from "@/services/classService";
import { studentService } from "@/services/studentService";
import { Student } from "@/types/student";
import { schoolService } from "@/services/schoolService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";
import { School } from "@/services/authService";

const TransferStudentPage = () => {
  const { selectedSchool } = useAuthStore();

  const [classes, setClasses] = useState<Class[]>([]);
  const [fromClassId, setFromClassId] = useState<string>("");
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [fromSectionId, setFromSectionId] = useState<string>("");

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [schools, setSchools] = useState<School[]>([]);
  const [toSchoolId, setToSchoolId] = useState<string>("");
  const [toClasses, setToClasses] = useState<Class[]>([]);
  const [toClassId, setToClassId] = useState<string>("");
  const [toSections, setToSections] = useState<ClassSection[]>([]);
  const [toSectionId, setToSectionId] = useState<string>("");
  const [transferReason, setTransferReason] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useToast();

  // Fetch initial data
  useEffect(() => {
    if (selectedSchool?.schoolId) {
      classService.getClasses(selectedSchool.schoolId).then(res => setClasses(res.data?.data || []));
      schoolService.getSchools().then((res: any) => setSchools(res?.data?.data ?? []));
    }
  }, [selectedSchool?.schoolId]);

  // Get current class sections
  useEffect(() => {
    const selectedClass = classes.find(c => c.id === fromClassId);
    setSections(selectedClass?.sections || []);
    setFromSectionId("");
  }, [fromClassId, classes]);

  // Get destination school classes
  useEffect(() => {
    if (toSchoolId) {
      classService.getClasses(toSchoolId).then(res => setToClasses(res.data?.data || []));
    } else {
      setToClasses([]);
    }
    setToClassId("");
    setToSectionId("");
  }, [toSchoolId]);

  // Get destination class sections
  useEffect(() => {
    const selectedClass = toClasses.find(c => c.id === toClassId);
    setToSections(selectedClass?.sections || []);
    setToSectionId("");
  }, [toClassId, toClasses]);

  // Fetch students for current section
  useEffect(() => {
    if (fromSectionId && selectedSchool?.schoolId) {
      studentService
        .getStudentsBySection(selectedSchool.schoolId, {sectionId: fromSectionId})
        .then(res => setStudents(res.data?.data || []))
        .catch(() => setStudents([]));
    } else {
      setStudents([]);
    }
    setSelectedStudents([]);
  }, [fromSectionId, selectedSchool?.schoolId]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleTransfer = async () => {
    if (selectedStudents.length === 0) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please select at least one student to transfer.",
      });
      return;
    }
    if (!toSchoolId || !toClassId || !toSectionId) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please select a destination school, class, and section.",
      });
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
      showToast({
        title: "Success",
        message: "Students transferred successfully!",
        type: "success",
      });
      setStudents([]);
      setSelectedStudents([]);
    } catch (error: unknown) {
      showToast({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to transfer students.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Student Transfer</h1>
        <p className="text-sm text-muted-foreground">
          Transfer students between schools, classes, and sections.
        </p>
      </div>

      {/* Step 1: Select Students */}
      <Card>
        <CardHeader>
          <CardTitle>Select Students</CardTitle>
          <CardDescription>Choose the class and section to filter students.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Select onValueChange={setFromClassId} value={fromClassId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Current Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setFromSectionId} value={fromSectionId} disabled={!fromClassId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Current Section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map(s => (
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
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Select which students to transfer.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedStudents.length === students.length && students.length > 0}
                      onCheckedChange={(checked) =>
                        checked
                          ? setSelectedStudents(students.map(s => s?.studentId || ''))
                          : setSelectedStudents([])
                      }
                    />
                  </TableHead>
                  <TableHead className="text-left">Name</TableHead>
                  <TableHead className="text-left">Admission No</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.studentId} className="hover:bg-muted/20">
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.studentId || student.id || '')}
                        onCheckedChange={() => handleSelectStudent(student.studentId || student.id || '')}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.admissionNumber || student.admission_number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Transfer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
          <CardDescription>
            Choose the destination school, class, and section.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select onValueChange={setToSchoolId} value={toSchoolId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select School" />
            </SelectTrigger>
            <SelectContent>
              {schools.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setToClassId} value={toClassId} disabled={!toSchoolId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {toClasses.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setToSectionId} value={toSectionId} disabled={!toClassId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {toSections.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="sm:col-span-2 lg:col-span-3">
            <Input
              placeholder="Transfer Reason (optional)"
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Action */}
      <div className="flex justify-end">
        <Button
          size="lg"
          className="w-full sm:w-auto"
          onClick={handleTransfer}
          disabled={isLoading || selectedStudents.length === 0}
        >
          {isLoading
            ? "Transferring..."
            : `Transfer ${selectedStudents.length} Student${
                selectedStudents.length > 1 ? "s" : ""
              }`}
        </Button>
      </div>
    </div>
  );
};

export default withAuth(TransferStudentPage, ADMINS_ROLES);
