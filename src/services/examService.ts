import {
  ApiResponse,
  Exam,
  ExamPaper,
  ExamAttemptResponse,
  StudentExam,
} from "@/types/exam";
import { apiClient } from "@/utils/api";

const EXAM_BASE_URL = "/exam";

export const getAllExams = async (
  filters: {
    schoolId: string;
    sessionId: string;
    termId?: string;
  },
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<Exam[]>> => {
  const query = new URLSearchParams(filters).toString();
  const response = await apiClient.get(
    `${EXAM_BASE_URL}/management?page=${page}&limit=${limit}&${query}`
  );
  return response as ApiResponse<Exam[]>;
};

export const getExamById = async (
  examId: string,
  studentId?: string
): Promise<ApiResponse<Exam>> => {
  const response = await apiClient.get(
    `${EXAM_BASE_URL}/management/${examId}${
      studentId ? `?studentId=${studentId}` : ""
    }`
  );
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
  const response = await apiClient.post(`${EXAM_BASE_URL}/management`, {
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
    `${EXAM_BASE_URL}/management/${examId}`,
    examData
  );
  return response as ApiResponse<Exam>;
};

export const submitExam = async (
  attemptId: string
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post(
    `${EXAM_BASE_URL}/cbt/attempts/${attemptId}/submit`
  );
  return response as ApiResponse<unknown>;
};

export const getStudentExams = async (
  studentId: string,
  sessionId: string
): Promise<
  ApiResponse<{
    StudentExam: StudentExam;
  }>
> => {
  const response = await apiClient.get(
    `${EXAM_BASE_URL}/management/student/${studentId}?sessionId=${sessionId}`
  );
  return response as ApiResponse<{
    StudentExam: StudentExam;
  }>;
};

export const getStudentExamTimetable = async (
  studentId: string
): Promise<ApiResponse<ExamPaper[]>> => {
  const response = await apiClient.get(
    `${EXAM_BASE_URL}/management/${studentId}/exams/timetable`
  );
  return response as ApiResponse<ExamPaper[]>;
};

export const getStudentTermReport = async (
  studentId: string,
  termId: string,
  sessionId: string
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.get(
    `${EXAM_BASE_URL}/reports/student-term-report?studentId=${studentId}&termId=${termId}&sessionId=${sessionId}`
  );
  return response as ApiResponse<unknown>;
};

export const publishResults = async (
  paperId: string,
  publish: boolean
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post(
    `${EXAM_BASE_URL}/results/publish/${paperId}`,
    {
      publish,
    }
  );
  return response as ApiResponse<unknown>;
};

export const saveManualResults = async (payload: {
  examPaperId: string;
  termId: string;
  sessionId: string;
  studentMarks: {
    studentId: string;
    marksObtained: number;
    teacherRemark?: string;
    psychomotorAssessments?: {
      skillId: string;
      rating: number;
    }[];
  }[];
}): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post(
    `${EXAM_BASE_URL}/results/manual-entry`,
    payload
  );
  return response as ApiResponse<unknown>;
};

export const finalizeCbtResult = async (
  paperId: string
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post(
    `${EXAM_BASE_URL}/results/finalize-cbt/${paperId}`
  );
  return response as ApiResponse<unknown>;
};

export const getExamPapers = async (
  filters: {
    schoolId: string;
    termId?: string;
    sectionId?: string;
  },
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<ExamPaper[]>> => {
  const query = new URLSearchParams(filters).toString();
  const response = await apiClient.get(
    `${EXAM_BASE_URL}/management/exam/papers?page=${page}&limit=${limit}&${query}`
  );
  return response as ApiResponse<ExamPaper[]>;
};

export const deleteExam = async (
  examId: string
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete(
    `${EXAM_BASE_URL}/management/${examId}`
  );
  return response as ApiResponse<null>;
};

export const addExamPaper = async (
  examId: string,
  paperData: Partial<ExamPaper>
): Promise<ApiResponse<ExamPaper>> => {
  const response = await apiClient.post(
    `${EXAM_BASE_URL}/management/${examId}/papers`,
    paperData
  );
  return response as ApiResponse<ExamPaper>;
};

export const updateExamPaper = async (
  examId: string,
  paperId: string,
  paperData: Partial<ExamPaper>
): Promise<ApiResponse<ExamPaper>> => {
  const response = await apiClient.put(
    `${EXAM_BASE_URL}/management/${examId}/papers/${paperId}`,
    paperData
  );
  return response as ApiResponse<ExamPaper>;
};

export const deleteExamPaper = async (
  examId: string,
  paperId: string
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete(
    `${EXAM_BASE_URL}/management/${examId}/papers/${paperId}`
  );
  return response as ApiResponse<null>;
};

export const getExamPaperById = async (
  paperId: string
): Promise<ApiResponse<ExamPaper>> => {
  const response = await apiClient.get(
    `/exam/management/exam/papers/${paperId}`
  );
  return response as ApiResponse<ExamPaper>;
};

export const createAndfetchExamAttempt = async (
  paperId: string,
  schoolId: string
): Promise<ApiResponse<ExamAttemptResponse>> => {
  const response = await apiClient.post(`/exam/cbt/attempts/start`, {
    examPaperId: paperId,
    schoolId,
  });
  return response as ApiResponse<ExamAttemptResponse>;
};

export const saveAnswer = async (
  attemptId: string,
  responses: { questionId: string; studentAnswer: unknown }[]
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post(
    `${EXAM_BASE_URL}/cbt/attempts/${attemptId}/responses`,
    { responses }
  );
  return response as ApiResponse<unknown>;
};

export const addPsychomotor = async (data: unknown): Promise<unknown> => {
  const response = await apiClient.post("/exam/psychomotor/assessments", data);
  return response.data;
};

export const getPsychomotorSkills = async (): Promise<unknown> => {
  const response = await apiClient.get("/exam/settings/psychomotor");
  return response.data;
};

export const getStudentExamPapers = async (
  sessionId: string
): Promise<unknown> => {
  const response = await apiClient.get(
    `/exam/student/papers?sessionId=${sessionId}`
  );
  return response.data;
};
