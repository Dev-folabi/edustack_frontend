import { apiClient, ApiResponse } from '@/utils/api';
import { Student } from '@/types/student';

export interface PaginatedStudents {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  prevPage: number | null;
  nextPage: number | null;
  itemPerPage: number;
  data: Student[];
}

export const studentService = {
  getStudentsBySchool: (
    schoolId: string,
    filters: { sectionId?: string; name?: string; admissionNumber?: string, active?: boolean } = {}
  ): Promise<ApiResponse<PaginatedStudents>> => {
    const params = new URLSearchParams(filters as Record<string, string>);
    return apiClient.get(`/api/students/${schoolId}/all?${params.toString()}`);
  },
  getStudentsBySection: (
    schoolId: string,
    sectionId: string
  ): Promise<ApiResponse<PaginatedStudents>> => {
    const params = new URLSearchParams({ sectionId, active: 'true' });
    return apiClient.get(`/api/students/${schoolId}/all?${params.toString()}`);
  },
};
