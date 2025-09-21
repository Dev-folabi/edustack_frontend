import { create } from 'zustand';
import { getQuestionBanksBySubject } from '@/services/questionBankService';
import { QuestionBank } from '@/types/questionBank';

interface QuestionBankState {
  questionBanks: QuestionBank[];
  loading: boolean;
  error: string | null;
  fetchQuestionBanks: (subjectId: string) => Promise<void>;
}

export const useQuestionBankStore = create<QuestionBankState>((set) => ({
  questionBanks: [],
  loading: false,
  error: null,
  fetchQuestionBanks: async (subjectId: string) => {
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
}));
