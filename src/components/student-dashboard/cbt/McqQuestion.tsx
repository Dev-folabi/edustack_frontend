"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Question } from "@/types/examination";
import useExamStore from "@/store/examStore";

interface McqQuestionProps {
  question: Question;
}

const McqQuestion = ({ question }: McqQuestionProps) => {
  const { answers, setAnswer } = useExamStore();
  const currentAnswer = answers.get(question.id) as number[] | undefined;

  const handleAnswerChange = (value: string) => {
    // For single choice, the value is a string, not an array.
    if (value) {
      setAnswer(question.id, [parseInt(value, 10)]);
    }
  };

  return (
    <div>
      <p className="text-lg font-semibold mb-4">{question.questionText}</p>
      <ToggleGroup
        type="single"
        value={currentAnswer ? currentAnswer[0].toString() : ""}
        onValueChange={handleAnswerChange}
        className="flex flex-col items-start space-y-2"
      >
        {question.options?.map((option, index) => (
          <ToggleGroupItem
            key={index}
            value={index.toString()}
            className="w-full justify-start text-left h-auto py-3 px-4 border rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <span className="font-normal text-base">{option}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default McqQuestion;
