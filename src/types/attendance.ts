export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HOLIDAY = 'HOLIDAY',
  ON_LEAVE = 'ON_LEAVE',
}

export interface AttendanceRecord {
  studentId?: string;
  staffId?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface StudentAttendanceRequest {
  sectionId: string;
  subjectId?: string;
  date: string;
  records: AttendanceRecord[];
}

export interface StaffAttendanceRequest {
  date: string;
  records: AttendanceRecord[];
}

export interface Attendance {
  id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  student?: {
    id: string;
    name: string;
    admission_number: string;
  };
  staff?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}
