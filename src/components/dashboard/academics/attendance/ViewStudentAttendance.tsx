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

  const { user } = useAuthStore();
  const activeSchool = user?.schools[0];

  useEffect(() => {
    if (activeSchool) {
      classService.getClasses(activeSchool.schoolId).then((res) => {
        if (res.success) {
          setClasses(res.data.data);
        }
      });
    }
  }, [activeSchool]);

  useEffect(() => {
    if (selectedSection && activeSchool) {
      studentService.getStudentsBySection(activeSchool.schoolId, selectedSection).then((res) => {
        if (res.success) {
          setStudents(res.data.data);
        }
      });
    }
  }, [selectedSection, activeSchool]);

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
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
                <SelectItem value="">All Students</SelectItem>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DatePicker date={date} setDate={setDate} />

          <Button onClick={handleFetchAttendance} disabled={!selectedSection}>Fetch Attendance</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>{record.student?.name}</TableCell>
                <TableCell>{record.status}</TableCell>
                <TableCell>{record.subject?.name || 'N/A'}</TableCell>
                <TableCell>{record.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ViewStudentAttendance;
