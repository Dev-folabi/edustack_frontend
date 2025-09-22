import { Question } from "./question";
import { Subject } from "./subject";

export interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  schoolId: string;
  questions?: Question[];
  subject?: Subject;
  _count?: {
    questions: number;
  };
}
