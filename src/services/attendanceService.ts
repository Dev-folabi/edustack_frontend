import { apiClient, ApiResponse } from '@/utils/api';
import {
  StudentAttendanceRequest,
  StaffAttendanceRequest,
  Attendance,
} from '@/types/attendance';

export const takeSectionAttendance = (
  data: StudentAttendanceRequest
): Promise<ApiResponse> => {
  return apiClient.post('/api/attendance/section', data);
};

export const takeSubjectAttendance = (
  data: StudentAttendanceRequest
): Promise<ApiResponse> => {
  return apiClient.post('/api/attendance/subject', data);
};

export const getStudentAttendance = (params: {
  sectionId: string;
  date?: string;
  subjectId?: string;
  month?: number;
  year?: number;
  studentId?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ data: Attendance[] }>> => {
  const query = new URLSearchParams(
    params as Record<string, string>
  ).toString();
  return apiClient.get(`/api/attendance/student?${query}`);
};

export const takeStaffAttendance = (
  data: StaffAttendanceRequest
): Promise<ApiResponse> => {
  return apiClient.post('/api/attendance/staff', data);
};

export const getStaffAttendance = (params: {
  date?: string;
  month?: number;
  year?: number;
  staffId?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ data: Attendance[] }>> => {
  const query = new URLSearchParams(
    params as Record<string, string>
  ).toString();
  return apiClient.get(`/api/attendance/staff?${query}`);
};
