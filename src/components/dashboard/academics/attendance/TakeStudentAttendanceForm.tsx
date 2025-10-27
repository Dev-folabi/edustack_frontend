"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { classService, Class } from "@/services/classService";
import { subjectService, Subject } from "@/services/subjectService";
import { studentService } from "@/services/studentService";
import {
  takeSectionAttendance,
  takeSubjectAttendance,
} from "@/services/attendanceService";
import { AttendanceStatus, AttendanceRecord } from "@/types/attendance";
import { useToast } from "@/components/ui/Toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Student } from "@/types/student";
import {
  Users,
  Calendar,
  BookOpen,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { formatDateToYYYYMMDD } from "@/utils/date";

const TakeStudentAttendanceForm = () => {
  const [attendanceType, setAttendanceType] = useState<"section" | "subject">(
    "section"
  );
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{
    [key: string]: AttendanceStatus;
  }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { selectedSchool } = useAuthStore();
  const { showToast } = useToast();

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

  const handleFetchStudents = async () => {
    if (!selectedSection || !selectedSchool) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please select a section first.",
      });
      return;
    }

    setLoadingStudents(true);
    try {
      const res = await studentService.getStudentsBySchool(
        selectedSchool.schoolId,
        { sectionId: selectedSection }
      );
      if (res.success) {
        setStudents(res?.data?.data || []);
        // Initialize attendance records
        const initialRecords: { [key: string]: AttendanceStatus } = {};
        res?.data?.data?.forEach((student: Student) => {
          initialRecords[student?.studentId || ""] = AttendanceStatus.PRESENT;
        });
        setAttendanceRecords(initialRecords);
        showToast({
          type: "success",
          title: "Success",
          message: `Loaded ${res?.data?.data?.length || 0} students.`,
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch students.",
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [studentId]: note }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updatedRecords: { [key: string]: AttendanceStatus } = {};
    students.forEach((student) => {
      updatedRecords[student?.studentId || ""] = status;
    });
    setAttendanceRecords(updatedRecords);
  };

  const handleSubmit = async () => {
    if (!date || !selectedSection) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please select a date and section.",
      });
      return;
    }

    if (students.length === 0) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please fetch students first.",
      });
      return;
    }

    const records: AttendanceRecord[] = Object.entries(attendanceRecords).map(
      ([studentId, status]) => ({
        studentId,
        status,
        notes: notes[studentId] || "",
      })
    );

    setSubmitting(true);
    try {
      let res;
      if (attendanceType === "section") {
        res = await takeSectionAttendance({
          sectionId: selectedSection,
          date: formatDateToYYYYMMDD(date),
          records,
        });
      } else {
        if (!selectedSubject) {
          showToast({
            type: "error",
            title: "Error",
            message: "Please select a subject.",
          });
          setSubmitting(false);
          return;
        }
        res = await takeSubjectAttendance({
          sectionId: selectedSection,
          subjectId: selectedSubject,
          date: formatDateToYYYYMMDD(date),
          records,
        });
      }

      if (res.success) {
        showToast({
          type: "success",
          title: "Success",
          message: "Attendance submitted successfully.",
        });
        // Reset form
        setStudents([]);
        setAttendanceRecords({});
      } else {
        showToast({
          type: "error",
          title: "Error",
          message: res.message,
        });
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to submit attendance.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClassData = classes.find((c) => c.id === selectedClass);

  // Calculate attendance summary
  const presentCount = Object.values(attendanceRecords).filter(
    (s) => s === AttendanceStatus.PRESENT
  ).length;
  const absentCount = Object.values(attendanceRecords).filter(
    (s) => s === AttendanceStatus.ABSENT
  ).length;
  const lateCount = Object.values(attendanceRecords).filter(
    (s) => s === AttendanceStatus.LATE
  ).length;

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case AttendanceStatus.ABSENT:
        return <XCircle className="w-4 h-4 text-red-600" />;
      case AttendanceStatus.LATE:
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "bg-green-100 text-green-800 border-green-300";
      case AttendanceStatus.ABSENT:
        return "bg-red-100 text-red-800 border-red-300";
      case AttendanceStatus.LATE:
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Attendance Type
              </label>
              <Select
                onValueChange={(value) =>
                  setAttendanceType(value as "section" | "subject")
                }
                value={attendanceType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Attendance Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="section">Section Attendance</SelectItem>
                  <SelectItem value="subject">Subject Attendance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Class *</label>
              <Select onValueChange={setSelectedClass} value={selectedClass}>
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
                    <SelectItem value="placeholder" disabled>
                      No classes available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Section *</label>
              <Select
                onValueChange={setSelectedSection}
                value={selectedSection}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {selectedClassData?.sections.length ? (
                    selectedClassData.sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="placeholder" disabled>
                      No sections available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {attendanceType === "subject" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject *</label>
                <Select
                  onValueChange={setSelectedSubject}
                  value={selectedSubject}
                  disabled={!selectedSection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length > 0 ? (
                      subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="placeholder" disabled>
                        No subjects available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date *
              </label>
              <DatePicker value={date} onChange={setDate} />
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={handleFetchStudents}
              disabled={!selectedSection || loadingStudents}
              className="w-full sm:w-auto"
            >
              {loadingStudents ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Students...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Fetch Students
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      {students.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{students.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Present</p>
                    <p className="text-2xl font-bold text-green-600">
                      {presentCount}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Absent</p>
                    <p className="text-2xl font-bold text-red-600">
                      {absentCount}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Late</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {lateCount}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll(AttendanceStatus.PRESENT)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll(AttendanceStatus.ABSENT)}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Mark All Absent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll(AttendanceStatus.LATE)}
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Mark All Late
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Table */}
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="min-w-[200px]">
                        Student Name
                      </TableHead>
                      <TableHead className="min-w-[150px]">
                        Admission No.
                      </TableHead>
                      <TableHead className="min-w-[200px]">
                        Attendance Status
                      </TableHead>
                      <TableHead className="min-w-[200px]">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.studentId} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>
                          {student.admissionNumber || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={
                              attendanceRecords[student?.studentId || ""] ||
                              AttendanceStatus.PRESENT
                            }
                            onValueChange={(value) =>
                              handleStatusChange(
                                student?.studentId || "",
                                value as AttendanceStatus
                              )
                            }
                          >
                            <SelectTrigger
                              className={`w-full ${getStatusColor(
                                attendanceRecords[student?.studentId || ""]
                              )}`}
                            >
                              <div className="flex items-center gap-2">
                                {getStatusIcon(
                                  attendanceRecords[student?.studentId || ""]
                                )}
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(AttendanceStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(status)}
                                    {status}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Add a note..."
                            value={notes[student?.studentId || ""] || ""}
                            onChange={(e) =>
                              handleNoteChange(
                                student?.studentId || "",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Attendance"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {students.length === 0 && !loadingStudents && selectedSection && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-4">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                No students loaded
              </p>
              <p className="text-sm text-muted-foreground">
                Click &quot;Fetch Students&quot; to load students for attendance
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TakeStudentAttendanceForm;
