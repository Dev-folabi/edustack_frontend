"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { getStudentAttendance } from "@/services/attendanceService";
import { Attendance, AttendanceStatus } from "@/types/attendance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Calendar,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Filter,
} from "lucide-react";
import { formatDateToYYYYMMDD } from "@/utils/date";
import { Subject } from "@/types/subject";
import { subjectService } from "@/services/subjectService";

const StudentAttendanceView = () => {
  const [date, setDate] = useState<Date | undefined>();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [filterType, setFilterType] = useState<"section" | "subject">(
    "section"
  );
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  const { student } = useAuthStore();
  const sectionId = student?.student_enrolled?.[0]?.sectionId || "";

  useEffect(() => {
    if (sectionId) {
      subjectService
        .getSubjects({ sectionId})
        .then((res) => {
          if (res.success) {
            setSubjects(res.data.data);
          }
        });
    }
  }, [sectionId]);

  const handleFetchAttendance = async () => {
    if (!sectionId) return;

    setLoading(true);
    try {
      const params: any = { sectionId, studentId: student?.id};

      // Use specific date if provided, otherwise use month/year
      if (date) {
        params.date = formatDateToYYYYMMDD(date);
      } else {
        params.month = month;
        params.year = year;
      }

      if (filterType === "subject" && selectedSubject) {
        params.subjectId = selectedSubject;
      }

      const res = await getStudentAttendance(params);
      if (res.success) {
        setAttendanceRecords(res?.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Present
          </Badge>
        );
      case AttendanceStatus.ABSENT:
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Absent
          </Badge>
        );
      case AttendanceStatus.LATE:
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
            <Clock className="w-3 h-3 mr-1" />
            Late
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate summary statistics
  const presentCount = attendanceRecords.filter(
    (r) => r.status === AttendanceStatus.PRESENT
  ).length;
  const absentCount = attendanceRecords.filter(
    (r) => r.status === AttendanceStatus.ABSENT
  ).length;

  const attendanceRate =
    attendanceRecords.length > 0
      ? ((presentCount / attendanceRecords.length) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            View Attendance Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter Type
                </label>
                <Select
                  onValueChange={(value) =>
                    setFilterType(value as "section" | "subject")
                  }
                  value={filterType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section">Section</SelectItem>
                    <SelectItem value="subject">Subject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterType === "subject" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select
                    onValueChange={setSelectedSubject}
                    value={selectedSubject}
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
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Month
                </label>
                <Select
                  value={month.toString()}
                  onValueChange={(val) => setMonth(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(0, m - 1).toLocaleString("default", {
                          month: "long",
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select
                  value={year.toString()}
                  onValueChange={(val) => setYear(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: 10 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Specific Date</label>
                <DatePicker value={date} onChange={setDate} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium opacity-0">Action</label>
                <Button onClick={handleFetchAttendance} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Fetch Attendance
                    </>
                  )}
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              * Fetch Attendance to view records. Use date filters to narrow
              results.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {attendanceRecords.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">
                    {attendanceRecords.length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
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
                  <p className="text-sm text-muted-foreground">
                    Attendance Rate
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {attendanceRate}%
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Records Table */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-muted-foreground">
                Loading attendance records...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : attendanceRecords.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Attendance Records</span>
              <Badge variant="outline" className="text-sm">
                {attendanceRecords.length} record
                {attendanceRecords.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="min-w-[120px]">Date</TableHead>
                    <TableHead className="min-w-[180px]">
                      Student Name
                    </TableHead>
                    <TableHead className="min-w-[140px]">
                      Admission No.
                    </TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[150px]">Subject</TableHead>
                    <TableHead className="min-w-[200px]">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record, index) => (
                    <TableRow key={record.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.student?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {record.student?.admission_number || "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {record.subject?.name ? (
                          <Badge variant="outline">{record.subject.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Section
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        {record.notes ? (
                          <span className="text-sm">{record.notes}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No notes
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                Select filters to view attendance
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentAttendanceView;
