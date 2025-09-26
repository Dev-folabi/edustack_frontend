import { apiClient } from "@/utils/api";
import { IExam } from "@/types/exam.type";

interface GetExamsParams {
  schoolId: string;
  termId: string;
  sessionId: string;
  page?: number;
  limit?: number;
}

export const getExams = async (params: GetExamsParams): Promise<{ data: IExam[] }> => {
  const response = await apiClient.get('/exam/management', { params });
  return response.data;
};

export const getExamById = async (examId: string): Promise<IExam> => {
  const response = await apiClient.get(`/exam/management/${examId}`);
  return response.data.data;
};

export const addManualMarks = async (data: any): Promise<any> => {
  const response = await apiClient.post('/exam/results/manual-entry', data);
  return response.data;
};

export const addPsychomotor = async (data: any): Promise<any> => {
  const response = await apiClient.post('/exam/psychomotor/assessments', data);
  return response.data;
};

export const getStudentResults = async (examPaperId: string): Promise<any> => {
    const response = await apiClient.get(`/exam/results/paper/${examPaperId}`);
    return response.data;
};

export const generateStudentTermResult = async (studentId: string, termId: string, sessionId: string): Promise<any> => {
    const response = await apiClient.get(`/exam/reports/student-term-report`, {
        params: { studentId, termId, sessionId },
    });
    return response.data;
};

export const getPsychomotorSkills = async (): Promise<any> => {
    const response = await apiClient.get('/exam/settings/psychomotor');
    return response.data;
};

export const getStudentExamPapers = async (sessionId: string): Promise<any> => {
    const response = await apiClient.get(`/exam/student/papers?sessionId=${sessionId}`);
    return response.data;
};