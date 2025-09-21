export interface Exam {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
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
  subject: {
    id: string;
    name: string;
  };
  maxMarks: number;
  passMarks: number;
  startTime: string;
  endTime: string;
  mode: 'PAPER_BASED' | 'CBT';
  questionBankId?: string;
  totalQuestions?: number;
  instructions?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}
