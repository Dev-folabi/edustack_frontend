import { apiClient, ApiResponse } from '@/utils/api';
import { Student, StudentRegistrationPayload } from '@/types/student';

export interface PaginatedStudents {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  prevPage: number | null;
  nextPage: number | null;
  itemPerPage: number;
  data: Student[];
}

export interface StudentFilters {
  sectionId?: string;
  classId?: string;
  name?: string;
  admissionNumber?: string;
  email?: string;
  gender?: string;
  admissionDate?: string;
  status?: string; // enrolled, promoted, transferred, pending, rejected, graduated
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface PromotionPayload {
  studentIds: string[];
  fromClassId: string;
  toClassId: string;
  sectionId: string;
  promoteSessionId: string;
  isGraduate?: boolean;
}

export interface TransferPayload {
  studentIds: string[];
  toSchoolId: string;
  toClassId: string;
  toSectionId: string;
  transferReason?: string;
}


export const studentService = {
  registerStudent: (
    schoolId: string,
    data: StudentRegistrationPayload
  ): Promise<ApiResponse<any>> => {
    return apiClient.post(`/students/register/${schoolId}`, data);
  },

  getStudentsBySchool: (
    schoolId: string,
    filters: StudentFilters = {}
  ): Promise<ApiResponse<PaginatedStudents>> => {
    const params = new URLSearchParams(filters as Record<string, any>);
    return apiClient.get(`/students/${schoolId}/all?${params.toString()}`);
  },

  getStudentById: (studentId: string): Promise<ApiResponse<{ student: Student }>> => {
    return apiClient.get(`/students/${studentId}`);
  },

  updateStudent: (
    studentId: string,
    data: Partial<StudentRegistrationPayload>
  ): Promise<ApiResponse<Student>> => {
    return apiClient.put(`/students/${studentId}`, data);
  },

  promoteStudents: (data: PromotionPayload): Promise<ApiResponse<any>> => {
    return apiClient.put('/students/promote', data);
  },

  transferStudents: (data: TransferPayload): Promise<ApiResponse<any>> => {
    return apiClient.put('/students/transfer', data);
  },

  getStudentTermReport: (
    studentId: string,
    termId: string,
    sessionId: string
  ): Promise<ApiResponse<Blob>> => {
    return apiClient.get(
      `/exam/reports/student-term-report?studentId=${studentId}&termId=${termId}&sessionId=${sessionId}&format=pdf`,
      { responseType: 'blob' }
    );
  },

};
