import { create } from 'zustand';
import { getAllQuestionBanks, getQuestionBanksBySubject, getQuestionBankById } from '@/services/questionBankService';
import { QuestionBank } from '@/types/questionBank';

interface QuestionBankState {
  questionBanks: QuestionBank[];
  selectedQuestionBank: QuestionBank | null;
  loading: boolean;
  error: string | null;
  fetchQuestionBanksBySubject: (subjectId: string) => Promise<void>;
  fetchAllQuestionBanks: (schoolId: string) => Promise<void>;
  fetchQuestionBankById: (id: string) => Promise<void>;
}

export const useQuestionBankStore = create<QuestionBankState>((set) => ({
  questionBanks: [],
  selectedQuestionBank: null,
  loading: false,
  error: null,
  fetchQuestionBanksBySubject: async (subjectId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getQuestionBanksBySubject(subjectId);
      if (response.success) {
        set({
          questionBanks: response.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch question banks' });
    }
  },
  fetchAllQuestionBanks: async (schoolId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getAllQuestionBanks(schoolId);
      if (response.success) {
        set({
          questionBanks: response.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch question banks' });
    }
  },
  fetchQuestionBankById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getQuestionBankById(id);
      if (response.success) {
        set({
          selectedQuestionBank: response.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch question bank' });
    }
  },
}));
