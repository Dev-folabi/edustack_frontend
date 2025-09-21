import { ApiResponse } from '@/types/exam';
import { QuestionBank } from '@/types/questionBank';
import { handleApiError } from '@/utils/api';
import { api } from '@/utils/api';

const QB_BASE_URL = '/exam/question-banks';

export const getQuestionBanksBySubject = async (subjectId: string): Promise<ApiResponse<QuestionBank[]>> => {
  try {
    const response = await api.get(`${QB_BASE_URL}?subjectId=${subjectId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
