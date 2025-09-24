import { apiClient, ApiResponse } from '@/utils/api';
import { Exam, ExamAttempt, ExamResult, StudentAnswer } from '@/types/examination';

export interface ExamFilters {
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'RESULT_PUBLISHED';
  page?: number;
  limit?: number;
}

export const examinationService = {
  getExams: (filters: ExamFilters = {}): Promise<ApiResponse<{ exams: Exam[] }>> => {
    const params = new URLSearchParams(filters as Record<string, any>);
    // NOTE: I am assuming the endpoint for student exams is different from the admin one.
    // This might need adjustment if the API uses the same endpoint with a student context.
    return apiClient.get(`/exam/student/list?${params.toString()}`);
  },

  getExamPaper: (examPaperId: string): Promise<ApiResponse<Exam>> => {
    return apiClient.get(`/exam/student/paper/${examPaperId}`);
  },

  startExamAttempt: (examPaperId: string): Promise<ApiResponse<ExamAttempt>> => {
    return apiClient.post('/exam/cbt/attempts/start', { examPaperId });
  },

  saveResponse: (attemptId: string, response: StudentAnswer): Promise<ApiResponse<any>> => {
    return apiClient.post(`/exam/cbt/attempts/${attemptId}/responses`, response);
  },

  submitExam: (attemptId: string): Promise<ApiResponse<any>> => {
    return apiClient.post(`/exam/cbt/attempts/${attemptId}/submit`, {});
  },

  getStudentTermReport: (
    studentId: string,
    termId: string,
    sessionId: string
  ): Promise<ApiResponse<ExamResult>> => {
    return apiClient.get(
      `/exam/reports/student-term-report?studentId=${studentId}&termId=${termId}&sessionId=${sessionId}`
    );
  },

  getGradingScale: (): Promise<ApiResponse<any[]>> => {
    return apiClient.get('/exam/settings/grades');
  },
};
