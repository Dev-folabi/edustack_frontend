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
import { Input } from '@/components/ui/input';

interface AttendanceRecordWithNotes extends AttendanceRecord {
  notes?: string;
}

const TakeStaffAttendanceForm = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: AttendanceRecordWithNotes }>({});

  const { selectedSchool } = useAuthStore();

  useEffect(() => {
    if (selectedSchool) {
      staffService.getStaffBySchool(selectedSchool.schoolId, { isActive: true }).then((res) => {
        if (res.success) {
          setStaff(res.data?.data || []);
          const initialRecords: { [key: string]: AttendanceRecordWithNotes } = {};
          res.data.data.forEach((s: Staff) => {
            initialRecords[s.id] = { staffId: s.id, status: AttendanceStatus.PRESENT, notes: '' };
          });
          setAttendanceRecords(initialRecords);
        }
      });
    }
  }, [selectedSchool]);

  const handleAttendanceChange = (staffId: string, status: AttendanceStatus, notes: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [staffId]: { staffId, status, notes },
    }));
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

    const records: AttendanceRecord[] = Object.values(attendanceRecords).map(
      ({ staffId, status, notes }) => ({
        staffId,
        status,
        notes,
      })
    );

    try {
      // Adjust date to local timezone before sending to backend
      const adjustedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      const formattedDate = adjustedDate.toISOString().split('T')[0];

      const res = await takeStaffAttendance({
        date: formattedDate,
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
                  <TableHead>Notes</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {staff.map((s) => (
                  <TableRow key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>
                          <Select
                          value={attendanceRecords[s.id]?.status}
                          onValueChange={(value) => handleAttendanceChange(s.id, value as AttendanceStatus, attendanceRecords[s.id]?.notes || '')}
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
                      <TableCell>
                        <Input
                          value={attendanceRecords[s.id]?.notes}
                          onChange={(e) => handleAttendanceChange(s.id, attendanceRecords[s.id]?.status, e.target.value)}
                          placeholder="Optional notes"
                        />
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
