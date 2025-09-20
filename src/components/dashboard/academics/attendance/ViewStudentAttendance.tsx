'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { classService, Class } from '@/services/classService';
import { studentService } from '@/services/studentService';
import { getStudentAttendance } from '@/services/attendanceService';
import { Attendance } from '@/types/attendance';
import { Student } from '@/types/student';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ViewStudentAttendance = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);

  const { selectedSchool } = useAuthStore();

  useEffect(() => {
    if (selectedSchool) {
      classService.getClasses(selectedSchool.schoolId).then((res) => {
        if (res.success) {
          setClasses(res.data.data);
        }
      });
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (selectedSection && selectedSchool) {
      studentService.getStudentsBySection(selectedSchool.schoolId, selectedSection).then((res) => {
        if (res.success) {
          setStudents(res.data.data);
        }
      });
    }
  }, [selectedSection, selectedSchool]);

  const handleFetchAttendance = () => {
    if (!selectedSection) return;

    const params: any = { sectionId: selectedSection };
    if (date) params.date = date.toISOString().split('T')[0];
    if (selectedStudent) params.studentId = selectedStudent;

    getStudentAttendance(params).then((res) => {
      if (res.success) {
        setAttendanceRecords(res.data.data);
      }
    });
  };

  const selectedClassData = classes.find((c) => c.id === selectedClass);

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Student Attendance Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          <Select onValueChange={setSelectedClass} value={selectedClass}>
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

          <Select onValueChange={setSelectedSection} value={selectedSection} disabled={!selectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {selectedClassData?.sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedStudent} value={selectedStudent} disabled={!selectedSection}>
            <SelectTrigger>
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DatePicker date={date} setDate={setDate} />

          <Button onClick={handleFetchAttendance} disabled={!selectedSection} className="w-full">
            Fetch Attendance
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Date</TableHead>
                <TableHead className="min-w-[120px]">Student</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Subject</TableHead>
                <TableHead className="min-w-[120px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell className="whitespace-nowrap">{record.student?.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{record.status}</TableCell>
                  <TableCell className="whitespace-nowrap">{record.subject?.name || 'N/A'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{record.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewStudentAttendance;
