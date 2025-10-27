export interface Exam {
  id: string;
  title: string;
  status: "Draft" | "Scheduled" | "Ongoing" | "Completed" | "Cancelled";
  startDate: string;
  endDate: string;
  classId: string;
  sectionId: string;
  termId: string;
  sessionId: string;
  papers: ExamPaper[];
  subject?: {
    id?: string;
    name?: string;
  };
  term?: {
    id?: string;
    name?: string;
  };
  session?: {
    id?: string;
    name?: string;
  };
  class?: {
    id?: string;
    name?: string;
  };
  section?: {
    id?: string;
    name?: string;
  };
}

export interface Attempt {
  id: string;
  examPaperId: string;
  studentId: string;
  startedAt: string;
  submittedAt?: string;
  status: "InProgress" | "Submitted" | "Graded";
  totalScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamPaper {
  id: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  exam: Exam;
  maxMarks: number;
  paperDate: string;
  startTime: string;
  endTime: string;
  mode: "PaperBased" | "CBT";
  questionBankId?: string;
  totalQuestions?: number;
  instructions?: string;
  isResultPublished?: boolean;
  attempts?: Attempt[];
}

export interface ExamAttemptResponse {
  examPaper: ExamPaper;
  attempt: Attempt;
  questions: Question[];
}

export interface Question {
  id: string;
  type: "MCQ" | "TrueFalse" | "FillInBlanks";
  questionText: string;
  options: string[];
  marks: number;
}

export interface StudentExam {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  sessionId: string;
  status: "draft" | "scheduled" | "Ongoing" | "completed" | "Cancelled";
  createdById: string | null;
  createdAt: string;
  updatedAt: string;

  papers: Paper[];

  school: {
    name: string;
  };
  classInfo: {
    name: string;
  };
  section: {
    name: string;
  };
  term: {
    name: string;
  };
  session: {
    name: string;
  };
}

export interface Paper {
  id: string;
  title: string;
  totalMarks: number;
  durationMinutes: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}
