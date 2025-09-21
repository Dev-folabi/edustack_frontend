import { create } from 'zustand';
import { getStudentExams, getExamAttempt, getStudentResult } from '@/services/examService';
import { ExamPaper } from '@/types/exam';

interface StudentExamState {
  upcoming: ExamPaper[];
  ongoing: ExamPaper[];
  completed: ExamPaper[];
  published: ExamPaper[];
  currentAttempt: any | null;
  currentResult: any | null;
  loading: boolean;
  error: string | null;
  fetchStudentExams: () => Promise<void>;
  fetchExamAttempt: (attemptId: string) => Promise<void>;
  fetchStudentResult: (paperId: string) => Promise<void>;
}

export const useStudentExamStore = create<StudentExamState>((set) => ({
  upcoming: [],
  ongoing: [],
  completed: [],
  published: [],
  currentAttempt: null,
  currentResult: null,
  loading: false,
  error: null,
  fetchStudentExams: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getStudentExams();
      if (response.success) {
        set({
          ...response.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch student exams' });
    }
  },
  fetchExamAttempt: async (attemptId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getExamAttempt(attemptId);
      if (response.success) {
        set({
          currentAttempt: response.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch exam attempt' });
    }
  },
  fetchStudentResult: async (paperId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getStudentResult(paperId);
      if (response.success) {
        set({
          currentResult: response.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch result' });
    }
  },
}));
