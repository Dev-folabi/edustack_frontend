"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useStudentExamStore } from "@/store/studentExamStore";
import { saveAnswer, submitExam } from "@/services/examService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import QuestionRenderer from "@/components/student-dashboard/QuestionRenderer";
import QuestionNavigation from "@/components/student-dashboard/QuestionNavigation";
import TimerCard from "@/components/student-dashboard/TimerCard";
import { CustomButton } from "@/components/ui/CustomButton";

const CBTPage = () => {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const { fetchExamAttempt, currentAttempt, loading, error } =
    useStudentExamStore();
  const { selectedSchool } = useAuthStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [durationInSeconds, setDurationInSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dirtyAnswersRef = useRef<Set<string>>(new Set());

  // Fetch exam attempt
  useEffect(() => {
    if (!selectedSchool?.schoolId || !attemptId) return;
    fetchExamAttempt(attemptId, selectedSchool.schoolId).catch((err) =>
      console.error("Failed to fetch exam attempt:", err)
    );
  }, [attemptId, selectedSchool?.schoolId, fetchExamAttempt]);

  // Setup duration + initial time
  useEffect(() => {
    if (!currentAttempt) return;

    const duration =
      (new Date(currentAttempt.examPaper.endTime).getTime() -
        new Date(currentAttempt.examPaper.startTime).getTime()) /
      1000;
    setDurationInSeconds(duration);

    const startTime = new Date(currentAttempt.attempt.startedAt).getTime();
    const now = Date.now();
    const elapsed = (now - startTime) / 1000;

    setTimeLeft(Math.max(0, duration - elapsed));
  }, [currentAttempt]);

  // Countdown timer
  useEffect(() => {
    if (!currentAttempt) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentAttempt]);

  // Autosave every 30s
  useEffect(() => {
    if (!currentAttempt) return;
    const interval = setInterval(() => {
      const dirty = Array.from(dirtyAnswersRef.current);
      if (dirty.length > 0) {
        const responses = dirty.map((qid) => ({
          questionId: qid,
          studentAnswer: answers[qid],
        }));

        saveAnswer(currentAttempt?.attempt.id, responses)
          .then((res) => {
            if (res.success) dirtyAnswersRef.current.clear();
            else toast.error(res.message || "Failed to save answers.");
          })
          .catch(() => toast.error("Error saving answers. Check connection."));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [answers, attemptId]);

  // Submit exam with validation
  const handleSubmit = useCallback(async () => {
    if (!currentAttempt) return;
    if (isSubmitting) return;

    const unanswered = currentAttempt?.questions.filter((q) => !answers[q.id]);

    if (unanswered && unanswered.length > 0) {
      toast.error("Please attempt all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitExam(currentAttempt?.attempt.id);
      toast.success("Exam submitted successfully!");
      router.push("/student/examinations");
    } catch {
      toast.error("Failed to submit exam.");
      setIsSubmitting(false);
    }
  }, [attemptId, router, isSubmitting, currentAttempt, answers]);

  // Answer change
  const handleAnswerChange = (qid: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [qid]: answer }));
    dirtyAnswersRef.current.add(qid);
  };

  // Flag toggle
  const toggleFlag = (qid: string) => {
    setFlagged((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  // Current question
  const currentQuestion = useMemo(() => {
    if (!currentAttempt?.questions) return null;
    return currentAttempt.questions[currentQuestionIndex];
  }, [currentAttempt, currentQuestionIndex]);

  // ---- UI ----
  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 p-4">
        <div className="flex-grow">
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-24" />
          </Card>
        </div>
        <div className="w-full lg:w-72 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!currentAttempt || !currentQuestion)
    return <p className="p-4">Exam attempt not found.</p>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Main Question Area */}
      <div className="flex-grow">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">
              {currentAttempt.examPaper.exam.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFlag(currentQuestion.id)}
            >
              <Flag
                className={
                  flagged[currentQuestion.id]
                    ? "text-yellow-500"
                    : "text-gray-400"
                }
              />
            </Button>
          </div>

          <p className="font-semibold mb-4">
            Question {currentQuestionIndex + 1} of{" "}
            {currentAttempt.questions.length}
          </p>
          <p className="mb-4">{currentQuestion.questionText}</p>

          <QuestionRenderer
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswerChange={handleAnswerChange}
          />

          <div className="flex justify-between mt-6">
            <Button
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>
            <CustomButton
              onClick={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min(currentAttempt.questions.length - 1, prev + 1)
                )
              }
              disabled={
                currentQuestionIndex === currentAttempt.questions.length - 1
              }
            >
              Next
            </CustomButton>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
        <TimerCard timeLeft={timeLeft} totalDuration={durationInSeconds} />
        <QuestionNavigation
          questions={currentAttempt.questions}
          currentIndex={currentQuestionIndex}
          answers={answers}
          flagged={flagged}
          onNavigate={setCurrentQuestionIndex}
        />
        <CustomButton
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Exam"}
        </CustomButton>
      </div>
    </div>
  );
};

export default withAuth(CBTPage, [UserRole.STUDENT]);
