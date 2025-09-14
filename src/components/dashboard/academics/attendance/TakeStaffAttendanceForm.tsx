'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/DatePicker';
import { useAuthStore } from '@/store/authStore';
import { staffService } from '@/services/staffService';
import { takeStaffAttendance } from '@/services/attendanceService';
import { AttendanceStatus, AttendanceRecord } from '@/types/attendance';
import { toast } from '@/components/ui/use-toast';
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

  const { user } = useAuthStore();
  const activeSchool = user?.schools[0];

  useEffect(() => {
    if (activeSchool) {
      staffService.getStaffBySchool(activeSchool.schoolId, { isActive: true }).then((res) => {
        if (res.success) {
          setStaff(res.data.data);
           // Initialize attendance records
           const initialRecords: { [key: string]: AttendanceStatus } = {};
           res.data.data.forEach((s: Staff) => {
             initialRecords[s.id] = AttendanceStatus.PRESENT;
           });
           setAttendanceRecords(initialRecords);
        }
      });
    }
  }, [activeSchool]);

  const handleStatusChange = (staffId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => ({ ...prev, [staffId]: status }));
  };

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: 'Error',
        description: 'Please select a date.',
        variant: 'destructive',
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
