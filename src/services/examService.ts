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
  schoolId: string,
  sessionId: string,
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<Exam[]>> => {
  const response = await apiClient.get(
    `${EXAM_BASE_URL}/management?schoolId=${schoolId}&sessionId=${sessionId}&page=${page}&limit=${limit}`
  );
  return response as ApiResponse<Exam[]>;
};

export const getExamById = async (
  examId: string
): Promise<ApiResponse<Exam>> => {
  const response = await apiClient.get(`${EXAM_BASE_URL}/management/${examId}`);
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
  const response = await apiClient.put(`${EXAM_BASE_URL}/management/${examId}`, examData);
  return response as ApiResponse<Exam>;
};

export const getStudentResult = async (
  paperId: string
): Promise<ApiResponse<any>> => {
  const response = await apiClient.get(
    `${EXAM_BASE_URL}/management/student/results/${paperId}`
  );
  return response as ApiResponse<any>;
};

export const submitExam = async (
  attemptId: string
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(
    `${EXAM_BASE_URL}/cbt/attempts/${attemptId}/submit`
  );
  return response as ApiResponse<any>;
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
  termId: string,
  sessionId: string
): Promise<ApiResponse<any>> => {
  const response = await apiClient.get(
    `${EXAM_BASE_URL}/reports/student-term-report?termId=${termId}&sessionId=${sessionId}`
  );
  return response as ApiResponse<any>;
};

export const getTermReportByPaper = async (
  paperId: string
): Promise<ApiResponse<any>> => {
  const paperResponse = await getExamPaperById(paperId);
  if (
    !paperResponse.success ||
    !paperResponse.data.termId ||
    !paperResponse.data.sessionId
  ) {
    throw new Error("Could not find necessary details to fetch term report.");
  }
  const { termId, sessionId } = paperResponse.data;

  return getStudentTermReport(termId, sessionId);
};

export const publishResults = async (
  paperId: string,
  publish: boolean
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(
    `${EXAM_BASE_URL}/results/publish/${paperId}`,
    {
      publish,
    }
  );
  return response as ApiResponse<any>;
};

export const getEssayResponses = async (
  paperId: string
): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get(
    `${EXAM_BASE_URL}/results/essays-for-grading/${paperId}`
  );
  return response as ApiResponse<any[]>;
};

export const gradeEssayResponse = async (
  responseId: string,
  marks: number
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(
    `${EXAM_BASE_URL}/results/grade-essay/${responseId}`,
    { marksAwarded: marks }
  );
  return response as ApiResponse<any>;
};

export const saveManualResults = async (
  paperId: string,
  results: { studentId: string; marks: number }[]
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(
    `${EXAM_BASE_URL}/results/manual-entry`,
    {
      paperId,
      results,
    }
  );
  return response as ApiResponse<any>;
};

export const getExamPapers = async (filters: {
  termId: string;
  sectionId: string;
}): Promise<ApiResponse<ExamPaper[]>> => {
  const query = new URLSearchParams(filters).toString();
  const response = await apiClient.get(`${EXAM_BASE_URL}/papers?${query}`);
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

export const getExamPaperById = async (
  paperId: string
): Promise<ApiResponse<ExamPaper>> => {
  const response = await apiClient.get(`/exam/management/exam/papers/${paperId}`);
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
  responses: { questionId: string; studentAnswer: any }[]
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(
    `${EXAM_BASE_URL}/cbt/attempts/${attemptId}/responses`,
    { responses }
  );
  return response as ApiResponse<any>;
};
