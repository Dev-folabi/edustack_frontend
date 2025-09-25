import { create } from "zustand";
import { getStudentExams, createAndfetchExamAttempt, getStudentResult } from "@/services/examService";
import { StudentExam, ExamAttemptResponse } from "@/types/exam";

interface StudentExamState {
  exams: StudentExam[];
  currentAttempt:  ExamAttemptResponse;
  currentResult: null;
  loading: boolean;
  error: string | null;
  fetchStudentExams: (studentId: string, sessionId: string) => Promise<void>;
  fetchExamAttempt: (attemptId: string) => Promise<void>;
  fetchStudentResult: (paperId: string) => Promise<void>;
}


export const useStudentExamStore = create<StudentExamState>((set) => ({
  exams: [],
  currentAttempt: ExamAttemptResponse,
  currentResult: null,
  loading: false,
  error: null,

  fetchStudentExams: async (studentId: string, sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const response  = await getStudentExams(studentId, sessionId);
      if (response.success) {
        set({ exams: response.data, loading: false });
      } else {
        set({ loading: false, error: "Failed to fetch student exams" });
      }
    } catch (error) {
      set({ loading: false, error: String(error) });
    }
  },

 fetchExamAttempt: async (attemptId: string, schoolId: string) => {
  set({ loading: true, error: null });
  try {
    const response = await createAndfetchExamAttempt(attemptId, schoolId);
    if (response.success) {
      set({ currentAttempt: response.data, loading: false });
    } else {
      set({ loading: false, error: "Failed to fetch exam attempt" });
    }
  } catch (error) {
    set({ loading: false, error: String(error) });
  }
},


  fetchStudentResult: async (paperId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getStudentResult(paperId);
      if (response.success) {
        set({ currentResult: response.data, loading: false });
      } else {
        set({ loading: false, error: "Failed to fetch result" });
      }
    } catch (error) {
      set({ loading: false, error: String(error) });
    }
  },
}));
