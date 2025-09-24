import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { ExamPaper, StudentAnswer } from '@/types/examination';

interface ExamState {
  examPaper: ExamPaper | null;
  answers: Map<string, StudentAnswer['answer']>;
  currentQuestionIndex: number;
  remainingTime: number; // in seconds
  attemptId: string | null;
  setExamAttempt: (paper: ExamPaper, attemptId: string) => void;
  setAnswer: (questionId: string, answer: StudentAnswer['answer']) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setRemainingTime: (time: number) => void;
  decrementTime: () => void;
  reset: () => void;
}

const useExamStore = create<ExamState>()(
  devtools((set) => ({
    examPaper: null,
    answers: new Map(),
    currentQuestionIndex: 0,
    remainingTime: 0,
    attemptId: null,
    setExamAttempt: (paper, attemptId) => {
      const durationInSeconds = (new Date(paper.endTime).getTime() - Date.now()) / 1000;
      set({
        examPaper: paper,
        attemptId,
        remainingTime: durationInSeconds > 0 ? durationInSeconds : 0,
        currentQuestionIndex: 0,
        answers: new Map()
      });
    },
    setAnswer: (questionId, answer) =>
      set((state) => ({
        answers: new Map(state.answers).set(questionId, answer),
      })),
    setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
    setRemainingTime: (time) => set({ remainingTime: time }),
    decrementTime: () =>
      set((state) => ({
        remainingTime: state.remainingTime > 0 ? state.remainingTime - 1 : 0,
      })),
    reset: () => set({
        examPaper: null,
        answers: new Map(),
        currentQuestionIndex: 0,
        remainingTime: 0,
        attemptId: null,
    })
  }))
);

export default useExamStore;
