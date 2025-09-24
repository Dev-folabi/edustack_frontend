"use client";

import useExamStore from "@/store/examStore";
import { useEffect } from "react";
import { Clock } from "lucide-react";

const ExamHeader = () => {
  const { examPaper, remainingTime, decrementTime } = useExamStore();

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        decrementTime();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [decrementTime, remainingTime]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (!examPaper) {
    return null;
  }

  return (
    <div className="flex justify-between items-center p-4 border-b bg-card">
      <h2 className="text-xl font-bold text-card-foreground">{examPaper.subject.name}</h2>
      <div className="flex items-center space-x-2 text-lg font-semibold text-destructive">
        <Clock className="h-6 w-6" />
        <span>{formatTime(remainingTime)}</span>
      </div>
    </div>
  );
};

export default ExamHeader;
