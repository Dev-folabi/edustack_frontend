"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Flag } from "lucide-react";

interface Props {
  questions: { id: string }[];
  currentIndex: number;
  answers: Record<string, any>;
  flagged: Record<string, boolean>;
  onNavigate: (index: number) => void;
}

const QuestionNavigation = ({
  questions,
  currentIndex,
  answers,
  flagged,
  onNavigate,
}: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-5 gap-2">
        {questions.map((q, index) => {
          const isCurrent = currentIndex === index;
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "";
          const isFlagged = flagged[q.id];

          let variant: "default" | "secondary" | "outline" = "outline";
          if (isCurrent) variant = "default";
          else if (isAnswered) variant = "secondary";

          return (
            <Button
              key={q.id}
              size="sm"
              variant={variant}
              onClick={() => onNavigate(index)}
              className={`relative h-10 w-10 rounded-md ${
                isFlagged ? "border-2 border-yellow-500" : ""
              }`}
            >
              {index + 1}
              {isFlagged && (
                <Flag className="h-3 w-3 absolute top-1 right-1 text-yellow-500" />
              )}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default QuestionNavigation;
