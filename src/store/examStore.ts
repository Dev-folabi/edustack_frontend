import { create } from "zustand";
import {
  getAllExams,
  getExamById,
  getExamPaperById,
} from "@/services/examService";
import { Exam } from "@/types/exam";

import { ExamPaper } from "@/types/exam";

interface ExamState {
  exams: Exam[];
  selectedExam: Exam | null;
  selectedPaper: ExamPaper | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  fetchExams: (
    schoolId: string,
    sessionId: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  fetchExamById: (examId: string) => Promise<void>;
  fetchExamPaperById: (paperId: string) => Promise<void>;
}

export const useExamStore = create<ExamState>((set) => ({
  exams: [],
  selectedExam: null,
  selectedPaper: null,
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
  fetchExams: async (schoolId, sessionId, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await getAllExams({ schoolId, sessionId }, page, limit);
      if (response.success) {
        set({
          exams: response.data || [],
          totalItems: response.totalItems,
          totalPages: response.totalPages,
          currentPage: response.currentPage,
        });
      }
    } catch (error) {
      set({ exams: [], error: "Failed to fetch exams" });
    } finally {
      set({ loading: false });
    }
  },
  fetchExamById: async (examId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getExamById(examId);
      if (response.success) {
        set({
          selectedExam: response.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: "Failed to fetch exam details" });
    } finally {
      set({ loading: false });
    }
  },
  fetchExamPaperById: async (paperId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getExamPaperById(paperId);
      if (response.success) {
        set({
          selectedPaper: response.data,
          loading: false,
        });
      } else {
        set({
          selectedPaper: null,
          error: response.message || "Failed to fetch exam paper details",
        });
      }
    } catch (error) {
      set({ selectedPaper: null, error: "Failed to fetch exam paper details" });
    } finally {
      set({ loading: false });
    }
  },
}));
