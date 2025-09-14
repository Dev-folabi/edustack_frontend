'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { subjectService, Subject } from '@/services/subjectService';
import { studentService } from '@/services/studentService';
import {
  takeSectionAttendance,
  takeSubjectAttendance,
} from '@/services/attendanceService';
import { AttendanceStatus, AttendanceRecord } from '@/types/attendance';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Student } from '@/types/student';

const TakeStudentAttendanceForm = () => {
  const [attendanceType, setAttendanceType] = useState<'section' | 'subject'>(
    'section'
  );
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: AttendanceStatus }>({});

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
    if (selectedSection) {
      subjectService.getSubjects({ sectionId: selectedSection }).then((res) => {
        if (res.success) {
          setSubjects(res.data.data);
        }
      });
    }
  }, [selectedSection]);

  const handleFetchStudents = () => {
    if (selectedSection && activeSchool) {
      studentService.getStudentsBySection(activeSchool.schoolId, selectedSection).then((res) => {
        if (res.success) {
          setStudents(res.data.data);
          // Initialize attendance records
          const initialRecords: { [key: string]: AttendanceStatus } = {};
          res.data.data.forEach((student: Student) => {
            initialRecords[student.id] = AttendanceStatus.PRESENT;
          });
          setAttendanceRecords(initialRecords);
        }
      });
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!date || !selectedSection) {
      toast({
        title: 'Error',
        description: 'Please select a date and section.',
        variant: 'destructive',
      });
      return;
    }

    const records: AttendanceRecord[] = Object.entries(attendanceRecords).map(
      ([studentId, status]) => ({
        studentId,
        status,
      })
    );

    try {
      let res;
      if (attendanceType === 'section') {
        res = await takeSectionAttendance({
          sectionId: selectedSection,
          date: date.toISOString(),
          records,
        });
      } else {
        if (!selectedSubject) {
          toast({
            title: 'Error',
            description: 'Please select a subject.',
            variant: 'destructive',
          });
          return;
        }
        res = await takeSubjectAttendance({
          sectionId: selectedSection,
          subjectId: selectedSubject,
          date: date.toISOString(),
          records,
        });
      }

      if (res.success) {
        toast({
          title: 'Success',
          description: 'Attendance submitted successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: res.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const selectedClassData = classes.find((c) => c.id === selectedClass);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <Select
          onValueChange={(value) =>
            setAttendanceType(value as 'section' | 'subject')
          }
          defaultValue={attendanceType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Attendance Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="section">Section</SelectItem>
            <SelectItem value="subject">Subject</SelectItem>
          </SelectContent>
        </Select>

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

        {attendanceType === 'subject' && (
            <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={!selectedSection}>
            <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
                {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                    {s.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        )}

        <DatePicker date={date} setDate={setDate} />

        <Button onClick={handleFetchStudents} disabled={!selectedSection}>Fetch Students</Button>
      </div>

      {students.length > 0 && (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student.id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>
                                <Select
                                value={attendanceRecords[student.id]}
                                onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                                >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(AttendanceStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button onClick={handleSubmit} className="mt-4">Submit Attendance</Button>
        </>
      )}
    </div>
  );
};

export default TakeStudentAttendanceForm;
