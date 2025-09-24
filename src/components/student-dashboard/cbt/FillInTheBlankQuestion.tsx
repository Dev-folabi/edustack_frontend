"use client";

import { Input } from "@/components/ui/input";
import { Question } from "@/types/examination";
import useExamStore from "@/store/examStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";

interface FillInTheBlankQuestionProps {
  question: Question;
}

const FillInTheBlankQuestion = ({ question }: FillInTheBlankQuestionProps) => {
  const { answers, setAnswer } = useExamStore();
  const currentAnswer = (answers.get(question.id) as string) || "";
  const [localAnswer, setLocalAnswer] = useState(currentAnswer);
  const debouncedAnswer = useDebounce(localAnswer, 500);

  useEffect(() => {
    setAnswer(question.id, debouncedAnswer);
  }, [debouncedAnswer, question.id, setAnswer]);

  useEffect(() => {
    setLocalAnswer(currentAnswer);
  }, [currentAnswer]);

  return (
    <div>
      <p className="text-lg font-semibold mb-4">{question.questionText}</p>
      <Input
        type="text"
        value={localAnswer}
        onChange={(e) => setLocalAnswer(e.target.value)}
        className="max-w-md text-base"
        placeholder="Type your answer here"
      />
    </div>
  );
};

export default FillInTheBlankQuestion;
