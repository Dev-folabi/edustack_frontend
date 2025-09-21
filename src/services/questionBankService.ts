import { ApiResponse } from '@/types/exam';
import { QuestionBank } from '@/types/questionBank';
import { Question } from '@/types/question';
import { handleApiError } from '@/utils/api';
import { api } from '@/utils/api';

const QB_BASE_URL = '/exam/question-banks';

export const getAllQuestionBanks = async (schoolId: string): Promise<ApiResponse<QuestionBank[]>> => {
    try {
        const response = await api.get(`${QB_BASE_URL}?schoolId=${schoolId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const deleteQuestion = async (bankId: string, questionId: string): Promise<ApiResponse<null>> => {
    try {
        const response = await api.delete(`${QB_BASE_URL}/${bankId}/questions/${questionId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const bulkAddQuestionsToBank = async (bankId: string, questions: Partial<Question>[]): Promise<ApiResponse<any>> => {
    try {
        const response = await api.post(`${QB_BASE_URL}/${bankId}/questions/bulk`, { questions });
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const addQuestionToBank = async (bankId: string, questionData: any): Promise<ApiResponse<Question>> => {
    try {
        const response = await api.post(`${QB_BASE_URL}/${bankId}/questions`, questionData);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const updateQuestion = async (bankId: string, questionId: string, questionData: any): Promise<ApiResponse<Question>> => {
    try {
        const response = await api.put(`${QB_BASE_URL}/${bankId}/questions/${questionId}`, questionData);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const getQuestionBanksBySubject = async (subjectId: string): Promise<ApiResponse<QuestionBank[]>> => {
  try {
    const response = await api.get(`${QB_BASE_URL}?subjectId=${subjectId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getQuestionBankById = async (id: string): Promise<ApiResponse<QuestionBank>> => {
    try {
        const response = await api.get(`${QB_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const createQuestionBank = async (data: Omit<QuestionBank, 'id'>): Promise<ApiResponse<QuestionBank>> => {
    try {
        const response = await api.post(QB_BASE_URL, data);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const updateQuestionBank = async (id: string, data: Partial<Omit<QuestionBank, 'id'>>): Promise<ApiResponse<QuestionBank>> => {
    try {
        const response = await api.put(`${QB_BASE_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const deleteQuestionBank = async (id: string): Promise<ApiResponse<null>> => {
    try {
        const response = await api.delete(`${QB_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};
