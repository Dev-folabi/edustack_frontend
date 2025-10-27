"use client";

import { Question } from "@/types/exam";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Props {
  question: Question;
  answer: any;
  onAnswerChange: (id: string, answer: any) => void;
}

const QuestionRenderer = ({ question, answer, onAnswerChange }: Props) => {
  switch (question.type) {
    case "MCQ":
      return (
        <RadioGroup
          className="space-y-3"
          onValueChange={(value) => onAnswerChange(question.id, value)}
          value={answer}
        >
          {question.options?.map((option, index) => {
            const optionValue =
              typeof option === "object" && option !== null
                ? option.value
                : option;

            return (
              <Label
                key={index}
                htmlFor={`option-${index}`}
                className={`flex items-center p-3 rounded-lg border transition cursor-pointer ${
                  answer === optionValue
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <RadioGroupItem
                  value={optionValue}
                  id={`option-${index}`}
                  className="mr-2"
                />
                {optionValue}
              </Label>
            );
          })}
        </RadioGroup>
      );

    case "TrueFalse":
      return (
        <RadioGroup
          className="space-y-3"
          onValueChange={(val) => onAnswerChange(question.id, val === "true")}
          value={String(answer)}
        >
          {["true", "false"].map((val) => (
            <Label
              key={val}
              htmlFor={val}
              className={`flex items-center p-3 rounded-lg border transition cursor-pointer ${
                String(answer) === val
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <RadioGroupItem value={val} id={val} className="mr-2" />
              {val === "true" ? "True" : "False"}
            </Label>
          ))}
        </RadioGroup>
      );

    case "Essay":
      return (
        <Textarea
          rows={8}
          value={answer || ""}
          placeholder="Write your essay answer here..."
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500"
        />
      );

    case "FillInBlanks":
      return (
        <Input
          value={answer || ""}
          placeholder="Type your answer here..."
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
        />
      );

    default:
      return <p className="text-red-500">Unsupported question type</p>;
  }
};

export default QuestionRenderer;
