import { apiClient, ApiResponse } from "@/utils/api";
import { Student, StudentRegistrationPayload } from "@/types/student";

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
  admission_date?: string;
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
  promoteTermId: string;
  isGraduate: boolean;
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

  getStudentsBySection: (
    schoolId: string,
    filters: StudentFilters = {}
  ): Promise<ApiResponse<PaginatedStudents>> => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v != null && v !== "")
    );
    const params = new URLSearchParams(cleanFilters as Record<string, any>);
    return apiClient.get(`/students/${schoolId}/all?${params.toString()}`);
  },

  getStudentsBySchool: (
    schoolId: string,
    filters: StudentFilters = {}
  ): Promise<ApiResponse<PaginatedStudents>> => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v != null && v !== "")
    );
    const params = new URLSearchParams(cleanFilters as Record<string, any>);
    return apiClient.get(`/students/${schoolId}/all?${params.toString()}`);
  },

  getStudentById: (studentId: string): Promise<ApiResponse<Student>> => {
    return apiClient.get(`/students/${studentId}`);
  },

  updateStudent: (
    studentId: string,
    data: Partial<StudentRegistrationPayload>
  ): Promise<ApiResponse<Student>> => {
    return apiClient.put(`/students/${studentId}`, data);
  },

  promoteStudents: (data: PromotionPayload): Promise<ApiResponse<any>> => {
    return apiClient.put("/students/promote", data);
  },

  transferStudents: (data: TransferPayload): Promise<ApiResponse<any>> => {
    return apiClient.put("/students/transfer", data);
  },

  getStudentTermReport: (
    studentId: string,
    termId: string,
    sessionId: string
  ): Promise<ApiResponse<Blob>> => {
    return apiClient.get(
      `/exam/reports/student-term-report?studentId=${studentId}&termId=${termId}&sessionId=${sessionId}&format=pdf`
    );
  },

  // TODO: Replace with a real API call when the backend endpoint is available.
  getSectionTermReport: (
    sectionId: string,
    termId: string,
    sessionId: string
  ): Promise<ApiResponse<Blob>> => {
    // This service function is a placeholder and returns a dummy PDF blob.
    return new Promise((resolve) => {
      setTimeout(() => {
        const dummyPdf = new Blob(
          ["This is a dummy PDF for the whole section"],
          { type: "application/pdf" }
        );
        resolve({
          data: {
            success: true,
            message: "Dummy report generated",
            data: dummyPdf,
          },
        } as any);
      }, 1000);
    });
  },
};
