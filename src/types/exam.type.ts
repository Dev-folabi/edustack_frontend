export interface IExam {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  classId: string;
  sectionId: string;
  termId: string;
  sessionId: string;
  papers: IExamPaper[];
}

export interface IExamPaper {
  id: string;
  subjectId: string;
  maxMarks: number;
  startTime: string;
  endTime: string;
  mode: 'CBT' | 'PAPER';
  questionBankId?: string;
  totalQuestions?: number;
  instructions?: string;
}

export interface IPsychomotorSkill {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}