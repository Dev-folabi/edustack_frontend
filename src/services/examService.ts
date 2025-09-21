import { ApiResponse, Exam, ExamPaper } from '@/types/exam';
import { handleApiError } from '@/utils/api';
import { api } from '@/utils/api';

const EXAM_BASE_URL = '/exam/management';

export const getAllExams = async (schoolId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<Exam[]>> => {
  try {
    const response = await api.get(`${EXAM_BASE_URL}?schoolId=${schoolId}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getExamById = async (examId: string): Promise<ApiResponse<Exam>> => {
  try {
    const response = await api.get(`${EXAM_BASE_URL}/${examId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createExam = async (schoolId: string, examData: Omit<Exam, 'id' | 'class' | 'section' | 'term' | 'session' | 'papers'> & { startDate: string; endDate: string; classId: string; sectionId: string; termId: string; sessionId: string; }): Promise<ApiResponse<Exam>> => {
  try {
    const response = await api.post(EXAM_BASE_URL, { ...examData, schoolId });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updateExam = async (examId: string, examData: Partial<Omit<Exam, 'id' | 'class' | 'section' | 'term' | 'session' | 'papers'>>): Promise<ApiResponse<Exam>> => {
    try {
        const response = await api.put(`${EXAM_BASE_URL}/${examId}`, examData);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const deleteExam = async (examId: string): Promise<ApiResponse<null>> => {
    try {
        const response = await api.delete(`${EXAM_BASE_URL}/${examId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const addExamPaper = async (examId: string, paperData: any): Promise<ApiResponse<ExamPaper>> => {
    try {
      const response = await api.post(`${EXAM_BASE_URL}/${examId}/papers`, paperData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
};

export const updateExamPaper = async (examId: string, paperId: string, paperData: any): Promise<ApiResponse<ExamPaper>> => {
    try {
        const response = await api.put(`${EXAM_BASE_URL}/${examId}/papers/${paperId}`, paperData);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const deleteExamPaper = async (examId: string, paperId: string): Promise<ApiResponse<null>> => {
    try {
        const response = await api.delete(`${EXAM_BASE_URL}/${examId}/papers/${paperId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};
