export interface Exam {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  classId: string;
  sectionId: string;
  termId: string;
  sessionId: string;
  class: {
    id: string;
    name: string;
  };
  section: {
    id: string;
    name: string;
  };
  term: {
    id: string;
    name: string;
  };
  session: {
    id: string;
    name: string;
  };
  papers: ExamPaper[];
}

export interface ExamPaper {
  id: string;
  title?: string; // Added this field to distinguish papers like "1st CA" vs "Final Exam"
  subject: {
    id: string;
    name: string;
  };
  maxMarks: number;
  passMarks: number;
  paperDate: string;
  startTime: string;
  endTime: string;
  duration?: number; // Duration in seconds
  mode: 'PaperBased' | 'CBT';
  questionBankId?: string;
  totalQuestions?: number;
  instructions?: string;
  published?: boolean;
  sectionId?: string;
  termId: string;
  sessionId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}
