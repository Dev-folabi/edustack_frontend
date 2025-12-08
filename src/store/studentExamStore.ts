import { create } from "zustand";
import {
  getStudentExams,
  createAndfetchExamAttempt,
} from "@/services/examService";
import { StudentExam, ExamAttemptResponse } from "@/types/exam";

interface StudentExamState {
  exams: StudentExam[];
  currentAttempt: ExamAttemptResponse | null;
  currentResult: null;
  loading: boolean;
  error: string | null;
  fetchStudentExams: (studentId: string, sessionId: string) => Promise<void>;
  fetchExamAttempt: (attemptId: string, schoolId: string) => Promise<void>;
  fetchStudentResult: (paperId: string) => Promise<void>;
}

export const useStudentExamStore = create<StudentExamState>((set) => ({
  exams: [],
  currentAttempt: null,
  currentResult: null,
  loading: false,
  error: null,

  fetchStudentExams: async (studentId: string, sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getStudentExams(studentId, sessionId);
      if (response.success) {
        const examData = response.data;
        let normalizedData: StudentExam[] = [];
        if (Array.isArray(examData)) {
          if (examData.length > 0 && "StudentExam" in examData[0]) {
            normalizedData = examData.map((item: any) =>
              item.StudentExam ? item.StudentExam : item
            );
          } else {
            normalizedData = examData;
          }
        } else if (
          examData &&
          typeof examData === "object" &&
          "StudentExam" in examData
        ) {
          normalizedData = [examData.StudentExam];
        } else if (examData) {
          normalizedData = [examData];
        }
        set({ exams: normalizedData, loading: false });
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
        console.log({ response, resData: response.data });
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
      set({ loading: false });
    } catch (error) {
      set({ loading: false, error: String(error) });
    }
  },
}));
