"use client";

import useExamStore from "@/store/examStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QuestionNavigation = () => {
  const { examPaper, answers, currentQuestionIndex, setCurrentQuestionIndex } = useExamStore();

  if (!examPaper) {
    return null;
  }

  return (
    <div className="p-4 border-l h-full bg-card">
      <h3 className="text-lg font-bold mb-4 text-card-foreground">Questions</h3>
      <div className="grid grid-cols-4 gap-2">
        {examPaper.questions.map((question, index) => {
          const isAnswered = answers.has(question.id) && answers.get(question.id) !== undefined && answers.get(question.id) !== "" && (!Array.isArray(answers.get(question.id)) || (answers.get(question.id) as any[]).length > 0) ;
          const isCurrent = index === currentQuestionIndex;

          return (
            <Button
              key={question.id}
              variant={isCurrent ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentQuestionIndex(index)}
              className={cn("w-full h-10", isAnswered && !isCurrent && "bg-secondary text-secondary-foreground")}
            >
              {index + 1}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionNavigation;
