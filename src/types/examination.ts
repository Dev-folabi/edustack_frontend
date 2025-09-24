export enum ExamStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  RESULT_PUBLISHED = 'RESULT_PUBLISHED',
}

export enum QuestionType {
  MCQ = 'MCQ',
  ESSAY = 'ESSAY',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
}

export interface Exam {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: ExamStatus;
  papers: ExamPaper[];
  termId: string;
  sessionId: string;
}

export interface ExamPaper {
  id: string;
  subject: {
    id: string;
    name: string;
  };
  maxMarks: number;
  startTime: string;
  endTime: string;
  mode: 'CBT' | 'PAPER';
  totalQuestions: number;
  instructions: string;
  questions: Question[];
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer?: number[] | boolean | string;
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface StudentAnswer {
  questionId: string;
  answer: number[] | boolean | string;
}

export interface ExamAttempt {
  id: string;
  examPaperId: string;
  studentId: string;
  startTime: string;
  endTime?: string;
  score?: number;
  status: 'IN_PROGRESS' | 'SUBMITTED';
  responses: StudentAnswer[];
}

export interface SubjectResult {
  subject: string;
  score: number;
  grade: string;
  remarks: string;
}

export interface PsychomotorSkill {
  skill: string;
  score: number;
}

export interface ExamResult {
  student: {
    name: string;
    admission_number: string;
    class: string;
    section: string;
  };
  term: string;
  session: string;
  results: SubjectResult[];
  psychomotor: PsychomotorSkill[];
  remarks: {
    teacher: string;
    principal: string;
  };
  totalScore: number;
  average: number;
  overallGrade: string;
}
