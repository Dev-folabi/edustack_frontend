export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer?: string | string[];
  marks: number;
  difficulty: QuestionDifficulty;
}

export type QuestionType =
  | "MCQ"
  | "FillInBlanks"
  | "TrueFalse"
  | "Matching";
export type QuestionDifficulty = "Easy" | "Medium" | "Hard";
