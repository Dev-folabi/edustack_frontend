export interface Exam {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  papers: ExamPaper[];
}

export interface ExamPaper {
  id: string;
  subject: {
    id: string;
    name: string;
  };
  exam: Exam; // For accessing parent exam details like title
  maxMarks: number;
  paperDate: string;
  startTime: string;
  endTime: string;
  mode: 'PaperBased' | 'CBT';
  questionBankId?: string;
  totalQuestions?: number;
}

export interface Question {
    id: string;
    type: 'MCQ' | 'Essay' | 'FillInBlanks' | 'TrueFalse';
    questionText: string;
    options?: any;
    marks: number;
}

export interface ExamAttempt {
    id: string;
    examPaperId: string;
    studentId: string;
    startedAt: string;
    submittedAt?: string;
    status: 'InProgress' | 'Submitted' | 'Graded';
    totalScore?: number;
}

export interface ExamAttemptResponse {
    attempt: ExamAttempt;
    questions: Question[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}