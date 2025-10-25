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
import { subjectService, Subject } from '@/services/subjectService';
import { studentService } from '@/services/studentService';
import {
  takeSectionAttendance,
  takeSubjectAttendance,
} from '@/services/attendanceService';
import { AttendanceStatus, AttendanceRecord } from '@/types/attendance';
import { useToast } from '@/components/ui/Toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Student } from '@/types/student';
import { Input } from '@/components/ui/input';

interface AttendanceRecordWithNotes extends AttendanceRecord {
  notes?: string;
}

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
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: AttendanceRecordWithNotes }>({});

  const { selectedSchool } = useAuthStore();

  useEffect(() => {
    if (selectedSchool) {
      classService.getClasses(selectedSchool.schoolId).then((res) => {
        if (res.success) {
          setClasses(res?.data?.data || []);
        }
      });
    }
  }, [selectedSchool]);

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
    if (selectedSection && selectedSchool) {
      studentService.getStudentsBySection(selectedSchool.schoolId, { sectionId: selectedSection }).then((res) => {
        if (res.success) {
          setStudents(res?.data?.data || []);
          // Initialize attendance records
          const initialRecords: { [key: string]: AttendanceRecordWithNotes } = {};
          res?.data?.data?.forEach((student: Student) => {
            initialRecords[student?.studentId || ''] = {
              studentId: student?.studentId || '',
              status: AttendanceStatus.PRESENT,
              notes: '',
            };
          });
          setAttendanceRecords(initialRecords);
        }
      });
    }
  };

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus, notes: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: { studentId, status, notes },
    }));
  };

  const handleSubmit = async () => {
    if (!date || !selectedSection) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please select a date and section.',
      });
      return;
    }

    const records: AttendanceRecord[] = Object.values(attendanceRecords).map(
      ({ studentId, status, notes }) => ({
        studentId,
        status,
        notes,
      })
    );

    try {
      const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      const formattedDate = adjustedDate.toISOString().split('T')[0];

      let res;
      if (attendanceType === 'section') {
        res = await takeSectionAttendance({
          sectionId: selectedSection,
          date: formattedDate,
          records,
        });
      } else {
        if (!selectedSubject) {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'Please select a subject.',
          });
          return;
        }
        res = await takeSubjectAttendance({
          sectionId: selectedSection,
          subjectId: selectedSubject,
          date: formattedDate,
          records,
        });
      }

      if (res.success) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Attendance submitted successfully.',
        });
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: res.message,
        });
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    }
  };

  const selectedClassData = classes.find((c) => c.id === selectedClass);

  const { showToast } = useToast();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
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

        <DatePicker value={date} onChange={setDate} placeholder="Select Date" />
      </div>

      {students.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Student Name</TableHead>
                  <TableHead className="min-w-[150px]">Attendance Status</TableHead>
                  <TableHead className="min-w-[150px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="whitespace-nowrap">{student.name}</TableCell>
                    <TableCell>
                      <Select
                        value={attendanceRecords[student?.studentId || '']?.status}
                        onValueChange={(value) =>
                          handleAttendanceChange(
                            student?.studentId || '',
                            value as AttendanceStatus,
                            attendanceRecords[student?.studentId || '']?.notes || ''
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
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
                    <TableCell>
                      <Input
                        value={attendanceRecords[student?.studentId || '']?.notes}
                        onChange={(e) =>
                          handleAttendanceChange(
                            student?.studentId || '',
                            attendanceRecords[student?.studentId || '']?.status,
                            e.target.value
                          )
                        }
                        placeholder="Optional notes"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleSubmit} className="mt-4 w-full sm:w-auto">
            Submit Attendance
          </Button>
        </>
      )}
    </div>
  );
};

export default TakeStudentAttendanceForm;
