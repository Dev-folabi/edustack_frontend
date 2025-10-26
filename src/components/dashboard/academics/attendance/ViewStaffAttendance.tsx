"use client";

import { useState, useEffect, useCallback } from "react";
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
import { staffService } from "@/services/staffService";
import { getStaffAttendance } from "@/services/attendanceService";
import { Attendance, AttendanceStatus } from "@/types/attendance";
import { Staff } from "@/types/staff";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRole } from "@/constants/roles";
import {
  Users,
  Calendar,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  UserCheck,
} from "lucide-react";
import { formatDateToYYYYMMDD } from "@/utils/date";

const ViewStaffAttendance = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const { selectedSchool, staff } = useAuthStore();

  const canViewAll =
    selectedSchool?.role.includes(UserRole.ADMIN) ||
    selectedSchool?.role.includes(UserRole.SUPER_ADMIN);

  const handleFetchAttendance = useCallback(() => {
    const params: any = {};

    if (canViewAll) {
      if (selectedStaff && selectedStaff !== "all") {
        params.staffId = selectedStaff;
      }
      if (date) {
        params.date = formatDateToYYYYMMDD(date);
      } else {
        params.month = month;
        params.year = year;
      }
    } else {
      if (staff?.id) {
        params.staffId = staff.id;
        params.month = month;
        params.year = year;
      } else {
        console.error("Staff ID not available");
        return;
      }
    }

    if (
      canViewAll ||
      params.staffId ||
      (params.month && params.year) ||
      params.date
    ) {
      setLoading(true);
      getStaffAttendance(params)
        .then((res) => {
          if (res.success) {
            setAttendanceRecords(res.data?.data || []);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [canViewAll, selectedStaff, date, staff, month, year]);

  useEffect(() => {
    if (canViewAll && selectedSchool) {
      setLoadingStaff(true);
      staffService
        .getStaffBySchool(selectedSchool.schoolId, { isActive: true })
        .then((res) => {
          if (res.success) {
            setStaffList(res.data?.data || []);
          }
        })
        .finally(() => setLoadingStaff(false));
    }
  }, [canViewAll, selectedSchool]);

  useEffect(() => {
    handleFetchAttendance();
  }, [month, year, handleFetchAttendance]);

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
  const lateCount = attendanceRecords.filter(
    (r) => r.status === AttendanceStatus.LATE
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
            {canViewAll
              ? "View Staff Attendance Records"
              : "My Attendance Records"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4">
            {canViewAll ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Staff Member
                  </label>
                  <Select
                    onValueChange={setSelectedStaff}
                    value={selectedStaff}
                    disabled={loadingStaff}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                      {staffList.length > 0 ? (
                        staffList.map((s) => (
                          <SelectItem key={s.user.staff.id} value={s.user.staff.id}>
                            {s.user.staff.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="placeholder" disabled>
                          {loadingStaff
                            ? "Loading staff..."
                            : "No staff available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

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
                  <label className="text-sm font-medium opacity-0">
                    Action
                  </label>
                  <Button
                    onClick={handleFetchAttendance}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Fetch Records
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                  <label className="text-sm font-medium opacity-0 hidden sm:block">
                    Action
                  </label>
                  <Button
                    onClick={handleFetchAttendance}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Fetch Records
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {canViewAll
                ? "Select filters and click 'Fetch Records' to view staff attendance."
                : "Select month and year to view your attendance records."}
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
                <UserCheck className="w-8 h-8 text-blue-600" />
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
                    {canViewAll && (
                      <>
                        <TableHead className="min-w-[180px]">
                          Staff Name
                        </TableHead>
                        <TableHead className="min-w-[120px]">Role</TableHead>
                      </>
                    )}
                    <TableHead className="min-w-[120px]">Status</TableHead>
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
                      {canViewAll && (
                        <>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-blue-600" />
                              {record.staff?.name || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {record.staff?.role || "Staff"}
                            </Badge>
                          </TableCell>
                        </>
                      )}
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
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
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                No attendance records found
              </p>
              <p className="text-sm text-muted-foreground">
                {canViewAll
                  ? "Select filters and click 'Fetch Records' to view attendance data"
                  : "No attendance records available for the selected period"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ViewStaffAttendance;
