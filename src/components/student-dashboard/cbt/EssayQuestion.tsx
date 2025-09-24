"use client";

import { Question } from "@/types/examination";
import useExamStore from "@/store/examStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";

interface EssayQuestionProps {
  question: Question;
}

const EssayQuestion = ({ question }: EssayQuestionProps) => {
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
      <textarea
        value={localAnswer}
        onChange={(e) => setLocalAnswer(e.target.value)}
        className="w-full h-64 p-3 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-base"
        placeholder="Type your answer here..."
      />
    </div>
  );
};

export default EssayQuestion;
