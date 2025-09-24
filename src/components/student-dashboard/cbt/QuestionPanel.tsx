"use client";

import { Question, QuestionType } from "@/types/examination";
import McqQuestion from "./McqQuestion";
import TrueFalseQuestion from "./TrueFalseQuestion";
import FillInTheBlankQuestion from "./FillInTheBlankQuestion";
import EssayQuestion from "./EssayQuestion";

interface QuestionPanelProps {
  question: Question;
}

const QuestionPanel = ({ question }: QuestionPanelProps) => {
  if (!question) {
    return <div>Loading question...</div>;
  }

  switch (question.type) {
    case QuestionType.MCQ:
      return <McqQuestion question={question} />;
    case QuestionType.TRUE_FALSE:
      return <TrueFalseQuestion question={question} />;
    case QuestionType.FILL_IN_THE_BLANK:
      return <FillInTheBlankQuestion question={question} />;
    case QuestionType.ESSAY:
      return <EssayQuestion question={question} />;
    default:
      return <div>Unsupported question type: {question.type}</div>;
  }
};

export default QuestionPanel;
