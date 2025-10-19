import { ApiResponse } from "@/types/exam";
import { QuestionBank } from "@/types/questionBank";
import { Question } from "@/types/question";
import { apiClient } from "@/utils/api";

const QB_BASE_URL = "/exam/question-banks";

export const getAllQuestionBanks = async (
  schoolId: string
): Promise<ApiResponse<QuestionBank[]>> => {
  const response = await apiClient.get(`${QB_BASE_URL}?schoolId=${schoolId}`);
  return response as ApiResponse<QuestionBank[]>;
};

export const deleteQuestion = async (
  bankId: string,
  questionId: string
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete(
    `${QB_BASE_URL}/${bankId}/questions/${questionId}`
  );
  return response as ApiResponse<null>;
};

export const addQuestionToBank = async (
  bankId: string,
  questionData: Omit<Question, "id">[]
): Promise<ApiResponse<Question[]>> => {
  const response = await apiClient.post(`${QB_BASE_URL}/${bankId}/questions`, {
    questions: questionData,
  });
  return response as ApiResponse<Question[]>;
};

export const updateQuestion = async (
  bankId: string,
  questionId: string,
  questionData: Partial<Question>
): Promise<ApiResponse<Question>> => {
  const response = await apiClient.put(
    `${QB_BASE_URL}/${bankId}/questions/${questionId}`,
    questionData
  );
  return response as ApiResponse<Question>;
};

export const getQuestionBanksBySubject = async (
  subjectId: string
): Promise<ApiResponse<QuestionBank[]>> => {
  const response = await apiClient.get(`${QB_BASE_URL}?subjectId=${subjectId}`);
  return response as ApiResponse<QuestionBank[]>;
};

export const getQuestionBankById = async (
  id: string
): Promise<ApiResponse<QuestionBank>> => {
  const response = await apiClient.get(`${QB_BASE_URL}/${id}`);
  return response as ApiResponse<QuestionBank>;
};

export const createQuestionBank = async (
  data: Omit<QuestionBank, "id">
): Promise<ApiResponse<QuestionBank>> => {
  const response = await apiClient.post(QB_BASE_URL, data);
  return response as ApiResponse<QuestionBank>;
};

export const updateQuestionBank = async (
  id: string,
  data: Partial<Omit<QuestionBank, "id">>
): Promise<ApiResponse<QuestionBank>> => {
  const response = await apiClient.put(`${QB_BASE_URL}/${id}`, data);
  return response as ApiResponse<QuestionBank>;
};

export const deleteQuestionBank = async (
  id: string
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete(`${QB_BASE_URL}/${id}`);
  return response as ApiResponse<null>;
};
