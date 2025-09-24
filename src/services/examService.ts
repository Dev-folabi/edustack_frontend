import { ApiResponse, Exam, ExamPaper, ExamAttemptResponse } from "@/types/exam";
import { apiClient } from "@/utils/api";

const EXAM_BASE_URL = "/exam/management";

// This function seems to be for admins, but I'm keeping it for reference
export const getAllExams = async (
  schoolId: string,
  sessionId: string, 
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<Exam[]>> => {
    const response = await apiClient.get(
      `${EXAM_BASE_URL}?schoolId=${schoolId}&sessionId=${sessionId}&page=${page}&limit=${limit}`
    );
    return response as ApiResponse<Exam[]>;
};

export const getExamPaperById = async (
  paperId: string
): Promise<ApiResponse<ExamPaper>> => {
    const response = await apiClient.get(`/exam/papers/${paperId}`); // Assuming this endpoint exists
    return response as ApiResponse<ExamPaper>;
};

// Correctly handle the response for starting an exam
export const startExam = async (
  paperId: string
): Promise<ApiResponse<ExamAttemptResponse>> => {
    const response = await apiClient.post(`/exam/cbt/attempts/start`, {
      examPaperId: paperId,
    });
    return response as ApiResponse<ExamAttemptResponse>;
};

// Correctly handle saving an array of answers
export const saveAnswer = async (
  attemptId: string,
  responses: { questionId: string; studentAnswer: any }[]
): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(
      `/exam/cbt/attempts/${attemptId}/responses`,
      { responses }
    );
    return response as ApiResponse<any>;
};

export const submitExam = async (
  attemptId: string
): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(
      `/exam/cbt/attempts/${attemptId}/submit`
    );
    return response as ApiResponse<any>;
};

export const getStudentExams = async (): Promise<
  ApiResponse<{
    upcoming: ExamPaper[];
    ongoing: ExamPaper[];
    completed: ExamPaper[];
    published: ExamPaper[];
  }>
> => {
    // This endpoint needs to be created on the backend, assuming it will exist
    const response = await apiClient.get("/student/exams");
    return response as ApiResponse<{
      upcoming: ExamPaper[];
      ongoing: ExamPaper[];
      completed: ExamPaper[];
      published: ExamPaper[];
    }>;
};

export const getStudentExamTimetable = async (): Promise<ApiResponse<ExamPaper[]>> => {
    // This endpoint needs to be created on the backend, assuming it will exist
    const response = await apiClient.get("/student/exams/timetable");
    return response as ApiResponse<ExamPaper[]>;
};

export const getStudentTermReport = async (studentId: string, termId: string, sessionId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/reports/student-term-report?studentId=${studentId}&termId=${termId}&sessionId=${sessionId}`);
    return response as ApiResponse<any>;
};