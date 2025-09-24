import { ApiResponse, Exam, ExamPaper } from "@/types/exam";
import { apiClient } from "@/utils/api";

const EXAM_BASE_URL = "/exam/management";

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

export const getExamById = async (
  examId: string
): Promise<ApiResponse<Exam>> => {
    const response = await apiClient.get(`${EXAM_BASE_URL}/${examId}`);
    return response as ApiResponse<Exam>;
 
};

export const createExam = async (
  schoolId: string,
  examData: Omit<
    Exam,
    "id" | "class" | "section" | "term" | "session" | "papers"
  > & {
    startDate: string;
    endDate: string;
    classId: string;
    sectionId: string;
    termId: string;
    sessionId: string;
  }
): Promise<ApiResponse<Exam>> => {
  
    const response = await apiClient.post(EXAM_BASE_URL, {
      ...examData,
      schoolId,
    });
    return response as ApiResponse<Exam>;
 
};

export const updateExam = async (
  examId: string,
  examData: Partial<
    Omit<Exam, "id" | "class" | "section" | "term" | "session" | "papers">
  >
): Promise<ApiResponse<Exam>> => {
  
    const response = await apiClient.put(
      `${EXAM_BASE_URL}/${examId}`,
      examData
    );
    return response as ApiResponse<Exam>;
 
};

export const getStudentResult = async (
  paperId: string
): Promise<ApiResponse<any>> => {
  
    const response = await apiClient.get(`/student/results/${paperId}`);
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

export const startExam = async (
  paperId: string
): Promise<ApiResponse<{ attemptId: string }>> => {
  
    const response = await apiClient.post(`/exam/cbt/attempts/start`, {
      examPaperId: paperId,
    });
    return response as ApiResponse<{ attemptId: string }>;
 
};

export const getExamAttempt = async (
  attemptId: string
): Promise<ApiResponse<any>> => {
  
    const response = await apiClient.get(`/exam/cbt/attempts/${attemptId}`);
    return response as ApiResponse<any>;
 
};

export const saveAnswer = async (
  attemptId: string,
  questionId: string,
  answer: any
): Promise<ApiResponse<any>> => {
  
    const response = await apiClient.post(
      `/exam/cbt/attempts/${attemptId}/responses`,
      { questionId, studentAnswer: answer }
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
  
    const response = await apiClient.get("/student/exams");
    return response as ApiResponse<{
      upcoming: ExamPaper[];
      ongoing: ExamPaper[];
      completed: ExamPaper[];
      published: ExamPaper[];
    }>;
 
};

export const publishResults = async (
  paperId: string,
  publish: boolean
): Promise<ApiResponse<any>> => {
  
    const response = await apiClient.post(`/exam/results/publish/${paperId}`, {
      publish,
    });
    return response as ApiResponse<any>;
 
};

export const getEssayResponses = async (
  paperId: string
): Promise<ApiResponse<any[]>> => {
  
    const response = await apiClient.get(
      `/exam/results/essays-for-grading/${paperId}`
    );
    return response as ApiResponse<any[]>;
 
};

export const gradeEssayResponse = async (
  responseId: string,
  marks: number
): Promise<ApiResponse<any>> => {
  
    const response = await apiClient.post(
      `/exam/results/grade-essay/${responseId}`,
      { marksAwarded: marks }
    );
    return response as ApiResponse<any>;
 
};

export const saveManualResults = async (
  paperId: string,
  results: { studentId: string; marks: number }[]
): Promise<ApiResponse<any>> => {
  
    const response = await apiClient.post(`/exam/results/manual-entry`, {
      paperId,
      results,
    });
    return response as ApiResponse<any>;
 
};

export const getExamPaperById = async (
  paperId: string
): Promise<ApiResponse<ExamPaper>> => {
  
    const response = await apiClient.get(`/exam/papers/${paperId}`);
    return response as ApiResponse<ExamPaper>;
 
};

export const getExamPapers = async (filters: {
  termId: string;
  sectionId: string;
}): Promise<ApiResponse<ExamPaper[]>> => {
  
    const query = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/exam/papers?${query}`);
    return response as ApiResponse<ExamPaper[]>;
 
};

export const deleteExam = async (
  examId: string
): Promise<ApiResponse<null>> => {
  
    const response = await apiClient.delete(`${EXAM_BASE_URL}/${examId}`);
    return response as ApiResponse<null>;
 
};

export const addExamPaper = async (
  examId: string,
  paperData: any
): Promise<ApiResponse<ExamPaper>> => {
  
    const response = await apiClient.post(
      `${EXAM_BASE_URL}/${examId}/papers`,
      paperData
    );
    return response as ApiResponse<ExamPaper>;
 
};

export const updateExamPaper = async (
  examId: string,
  paperId: string,
  paperData: any
): Promise<ApiResponse<ExamPaper>> => {
  
    const response = await apiClient.put(
      `${EXAM_BASE_URL}/${examId}/papers/${paperId}`,
      paperData
    );
    return response as ApiResponse<ExamPaper>;
 
};

export const deleteExamPaper = async (
  examId: string,
  paperId: string
): Promise<ApiResponse<null>> => {
  
    const response = await apiClient.delete(
      `${EXAM_BASE_URL}/${examId}/papers/${paperId}`
    );
    return response as ApiResponse<null>;
 
};
