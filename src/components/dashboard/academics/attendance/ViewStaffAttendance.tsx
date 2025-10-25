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
import { useAuthStore } from "@/store/authStore";
import { staffService } from "@/services/staffService";
import { getStaffAttendance } from "@/services/attendanceService";
import { Attendance } from "@/types/attendance";
import { Staff } from "@/types/staff";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/constants/roles";
import { UserData } from "@/services/authService";

const ViewStaffAttendance = ({ user }: { user: UserData }) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);

  const { selectedSchool, staff } = useAuthStore();

  const canViewAll =
    user?.roles.includes(UserRole.ADMIN) ||
    user?.roles.includes(UserRole.SUPER_ADMIN);

  const handleFetchAttendance = useCallback(() => {
    const params: any = {};
    if (canViewAll) {
      if (selectedStaff) {
        params.staffId = selectedStaff;
      }
      if (date) {
        const adjustedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        params.date = adjustedDate.toISOString().split('T')[0];
      } else {
        // If no specific date is selected, use month and year for all staff view
        params.month = month;
        params.year = year;
      }
    } else {
      if (staff?.id) {
        params.staffId = staff.id;
        params.month = month;
        params.year = year;
      } else {
        console.error('Staff ID not available');
        return;
      }
    }

    // For super admin, allow fetching all staff attendance without staffId
    if (canViewAll || (params.staffId || (params.month && params.year) || params.date)) {
      getStaffAttendance(params).then((res) => {
        if (res.success) {
          setAttendanceRecords(res.data?.data || []);
        }
      });
    }
  }, [canViewAll, selectedStaff, date, staff, month, year]);

  useEffect(() => {
    if (canViewAll && selectedSchool) {
      staffService
        .getStaffBySchool(selectedSchool.schoolId, { isActive: true })
        .then((res) => {
          if (res.success) {
            setStaffList(res.data?.data || []);
          }
        });
    }
  }, [canViewAll, selectedSchool]);

  useEffect(() => {
    if (canViewAll) {
      handleFetchAttendance();
    } else if (!canViewAll) {
      handleFetchAttendance();
    }
  }, [month, year, canViewAll, handleFetchAttendance]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Staff Attendance Records</CardTitle>
      </CardHeader>
      <CardContent>
        {canViewAll ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <Select onValueChange={setSelectedStaff} value={selectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Staff</SelectItem>
                {staffList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <DatePicker date={date} setDate={setDate} />

            <Button onClick={handleFetchAttendance}>Fetch Attendance</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {canViewAll && <TableHead>Staff</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {new Date(record.date).toLocaleDateString()}
                </TableCell>
                {canViewAll && <TableCell>{record.staff?.name}</TableCell>}
                <TableCell>{record.status}</TableCell>
                <TableCell>{record.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ViewStaffAttendance;
