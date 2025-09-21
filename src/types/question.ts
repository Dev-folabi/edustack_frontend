export interface Question {
  id: string;
  type: 'MCQ' | 'ESSAY' | 'FILL_IN_BLANKS';
  questionText: string;
  options?: string[];
  correctAnswer?: any;
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}
