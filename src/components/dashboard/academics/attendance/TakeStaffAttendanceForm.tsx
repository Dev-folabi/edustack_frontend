'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { staffService } from '@/services/staffService';
import { takeStaffAttendance } from '@/services/attendanceService';
import { AttendanceStatus, AttendanceRecord } from '@/types/attendance';
import { useToast } from '@/components/ui/Toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Staff } from '@/types/staff';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { formatDateToYYYYMMDD } from '@/utils/date';

const TakeStaffAttendanceForm = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{
    [key: string]: AttendanceStatus;
  }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { selectedSchool } = useAuthStore();
  const { showToast } = useToast();

  const fetchStaff = async () => {
    if (!selectedSchool?.schoolId) return;
    
    setLoading(true);
    try {
      const res = await staffService.getStaffBySchool(
        selectedSchool.schoolId,
        { isActive: true }
      );
      if (res.success) {
        // Extract staff data from nested structure
        const staffData = res.data?.data?.map((item: any) => ({
          ...item.user.staff,
          role: item.role,
        })) || [];
        
        setStaff(staffData);
        const initialRecords: { [key: string]: AttendanceStatus } = {};
        staffData.forEach((s: Staff) => {
          initialRecords[s.id] = AttendanceStatus.PRESENT;
        });
        setAttendanceRecords(initialRecords);
        showToast({
          type: 'success',
          title: 'Success',
          message: `Loaded ${staffData.length} staff members.`,
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load staff members.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [selectedSchool?.schoolId]);

  const handleStatusChange = (staffId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => ({ ...prev, [staffId]: status }));
  };

  const handleNoteChange = (staffId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [staffId]: note }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updatedRecords: { [key: string]: AttendanceStatus } = {};
    staff.forEach((s) => {
      updatedRecords[s.id] = status;
    });
    setAttendanceRecords(updatedRecords);
  };

  const handleSubmit = async () => {
    if (!date) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please select a date.',
      });
      return;
    }

    if (staff.length === 0) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No staff members loaded.',
      });
      return;
    }

    const records: AttendanceRecord[] = Object.entries(attendanceRecords).map(
      ([staffId, status]) => ({
        staffId,
        status,
        notes: notes[staffId] || "",
      })
    );

    setSubmitting(true);
    try {
      const res = await takeStaffAttendance({
        date: formatDateToYYYYMMDD(date),
        records,
      });

      if (res.success) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Staff attendance submitted successfully.',
        });
        // Reset to current date and refetch
        setDate(new Date());
        fetchStaff();
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: res.message || 'Failed to submit attendance.',
        });
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'An error occurred.',
      });
    } finally {
      setSubmitting(false);
    }
  };

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
        return 'bg-green-100 text-green-800 border-green-300';
      case AttendanceStatus.ABSENT:
        return 'bg-red-100 text-red-800 border-red-300';
      case AttendanceStatus.LATE:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Date Selection & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Attendance Date *
              </label>
              <DatePicker value={date} onChange={setDate} />
            </div>
            <Button
              onClick={fetchStaff}
              disabled={loading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Staff
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Loading staff members...</p>
            </div>
          </CardContent>
        </Card>
      ) : staff.length > 0 ? (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Staff</p>
                    <p className="text-2xl font-bold">{staff.length}</p>
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
                        Staff Name
                      </TableHead>
                      <TableHead className="min-w-[150px]">Role</TableHead>
                      <TableHead className="min-w-[150px]">
                        Phone No
                      </TableHead>
                      <TableHead className="min-w-[200px]">
                        Attendance Status
                      </TableHead>
                      <TableHead className="min-w-[200px]">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((s, index) => (
                      <TableRow key={s.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            {s.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {s.role || 'Staff'}
                          </Badge>
                        </TableCell>
                        <TableCell>{s.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Select
                            value={attendanceRecords[s.id]}
                            onValueChange={(value) =>
                              handleStatusChange(s.id, value as AttendanceStatus)
                            }
                          >
                            <SelectTrigger
                              className={`w-full ${getStatusColor(
                                attendanceRecords[s.id]
                              )}`}
                            >
                              <div className="flex items-center gap-2">
                                {getStatusIcon(attendanceRecords[s.id])}
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
                            value={notes[s.id] || ""}
                            onChange={(e) =>
                              handleNoteChange(s.id, e.target.value)
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
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submit Attendance
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-4">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                No staff members found
              </p>
              <p className="text-sm text-muted-foreground">
                No active staff members available for attendance
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TakeStaffAttendanceForm;