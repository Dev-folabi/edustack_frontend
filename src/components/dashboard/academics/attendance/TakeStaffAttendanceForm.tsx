'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/DatePicker';
import { useAuthStore } from '@/store/authStore';
import { staffService } from '@/services/staffService';
import { takeStaffAttendance } from '@/services/attendanceService';
import { AttendanceStatus, AttendanceRecord } from '@/types/attendance';
import { useToast } from '@/components/ui/Toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Staff } from '@/types/staff';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';

const TakeStaffAttendanceForm = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: AttendanceStatus }>({});

  const { selectedSchool } = useAuthStore();

  useEffect(() => {
    if (selectedSchool) {
      staffService.getStaffBySchool(selectedSchool.schoolId, { isActive: true }).then((res) => {
        if (res.success) {
          setStaff(res.data?.data || []);
           const initialRecords: { [key: string]: AttendanceStatus } = {};
           res.data.data.forEach((s: Staff) => {
             initialRecords[s.id] = AttendanceStatus.PRESENT;
           });
           setAttendanceRecords(initialRecords);
        }
      });
    }
  }, [selectedSchool]);

  const handleStatusChange = (staffId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => ({ ...prev, [staffId]: status }));
  };

  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!date) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please select a date.',
      });
      return;
    }

    const records: AttendanceRecord[] = Object.entries(attendanceRecords).map(
      ([staffId, status]) => ({
        staffId,
        status,
      })
    );

    try {
      const res = await takeStaffAttendance({
        date: date.toISOString(),
        records,
      });

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

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DatePicker date={date} setDate={setDate} />
      </div>

      <Table>
          <TableHeader>
              <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Status</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {staff.map((s) => (
                  <TableRow key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>
                          <Select
                          value={attendanceRecords[s.id]}
                          onValueChange={(value) => handleStatusChange(s.id, value as AttendanceStatus)}
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
    </div>
  );
};

export default TakeStaffAttendanceForm;
