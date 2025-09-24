"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Question } from "@/types/examination";
import useExamStore from "@/store/examStore";

interface TrueFalseQuestionProps {
  question: Question;
}

const TrueFalseQuestion = ({ question }: TrueFalseQuestionProps) => {
  const { answers, setAnswer } = useExamStore();
  const currentAnswer = answers.get(question.id) as boolean | undefined;

  const handleAnswerChange = (value: string) => {
    if (value) {
      setAnswer(question.id, value === 'true');
    }
  };

  return (
    <div>
      <p className="text-lg font-semibold mb-4">{question.questionText}</p>
      <ToggleGroup
        type="single"
        value={currentAnswer === undefined ? "" : currentAnswer ? "true" : "false"}
        onValueChange={handleAnswerChange}
        className="flex items-center space-x-4"
      >
        <ToggleGroupItem value="true" className="px-10 py-3 text-base" aria-label="True">
          True
        </ToggleGroupItem>
        <ToggleGroupItem value="false" className="px-10 py-3 text-base" aria-label="False">
          False
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default TrueFalseQuestion;
