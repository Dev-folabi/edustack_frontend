"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useStudentExamStore } from "@/store/studentExamStore";
import { saveAnswer, submitExam } from "@/services/examService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { Flag, Clock, BookOpen, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import QuestionRenderer from "@/components/student-dashboard/QuestionRenderer";
import { CustomButton } from "@/components/ui/CustomButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CBTPage = () => {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const { fetchExamAttempt, currentAttempt, loading, error } =
    useStudentExamStore();
  const { selectedSchool } = useAuthStore();
  const { showToast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [durationInSeconds, setDurationInSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const dirtyAnswersRef = useRef<Set<string>>(new Set());
  const hasAutoSubmittedRef = useRef(false);

  // Fetch exam attempt
  useEffect(() => {
    if (!attemptId || !selectedSchool?.schoolId) return;
    if (currentAttempt?.attempt?.id === attemptId) return;
    fetchExamAttempt(attemptId, selectedSchool.schoolId).catch((err) =>
      console.error("Failed to fetch exam attempt:", err)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, selectedSchool?.schoolId]);

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

    setTimeLeft(Math.max(0, Math.floor(duration - elapsed)));
  }, [currentAttempt]);

  // Countdown timer
  useEffect(() => {
    if (!currentAttempt || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          if (!hasAutoSubmittedRef.current) {
            hasAutoSubmittedRef.current = true;
            handleAutoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentAttempt, timeLeft]);

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
            else
              showToast({
                type: "error",
                title: "Error",
                message: res.message || "Failed to save answers.",
              });
          })
          .catch(() =>
            showToast({
              type: "error",
              title: "Error",
              message: "Error saving answers. Check connection.",
            })
          );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [answers, currentAttempt]);

  // Auto-submit when time runs out
  const handleAutoSubmit = useCallback(async () => {
    if (!currentAttempt || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Save any pending answers before submitting
      const dirty = Array.from(dirtyAnswersRef.current);
      if (dirty.length > 0) {
        const responses = dirty.map((qid) => ({
          questionId: qid,
          studentAnswer: answers[qid],
        }));
        await saveAnswer(currentAttempt.attempt.id, responses);
        dirtyAnswersRef.current.clear();
      }

      await submitExam(currentAttempt.attempt.id);
      showToast({
        type: "success",
        title: "Success",
        message: "Time's up! Exam submitted automatically.",
      });
      router.push("/student/examinations");
    } catch (error) {
      console.error("Auto-submit error:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to submit exam.",
      });
      setIsSubmitting(false);
    }
  }, [currentAttempt, router, isSubmitting, answers]);

  // Submit exam with validation
  const handleSubmit = useCallback(async () => {
    if (!currentAttempt) return;
    if (isSubmitting) return;

    const unanswered = currentAttempt?.questions.filter(
      (q) => !answers[q.id] || answers[q.id] === ""
    );

    if (unanswered && unanswered.length > 0) {
      setShowSubmitDialog(true);
      return;
    }

    // Proceed with submission
    await proceedWithSubmission();
  }, [currentAttempt, isSubmitting, answers]);

  // Actual submission logic
  const proceedWithSubmission = useCallback(async () => {
    if (!currentAttempt) return;

    setIsSubmitting(true);
    setShowSubmitDialog(false);

    try {
      // Save any pending answers before submitting
      const dirty = Array.from(dirtyAnswersRef.current);
      if (dirty.length > 0) {
        const responses = dirty.map((qid) => ({
          questionId: qid,
          studentAnswer: answers[qid],
        }));
        await saveAnswer(currentAttempt.attempt.id, responses);
        dirtyAnswersRef.current.clear();
      }

      await submitExam(currentAttempt.attempt.id);
      showToast({
        type: "success",
        title: "Success",
        message: "Exam submitted successfully!",
      });
      router.push("/student/examinations");
    } catch (error) {
      console.error("Submit error:", error);
      showToast({
        type: "error",
        title: "Error",
        message:
          error && typeof error === "object" && "data" in error && error.data && typeof error.data === "object" && "message" in error.data
            ? String(error.data.message)
            : "Failed to submit exam.",
      });
      setIsSubmitting(false);
    }
  }, [currentAttempt, router, answers]);

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

  // Format time as hr:m:s
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const timePercent = Math.max(0, (timeLeft / durationInSeconds) * 100);
  const progressColor =
    timePercent > 50
      ? "bg-green-500"
      : timePercent > 20
      ? "bg-yellow-500"
      : "bg-red-500";

  // Calculate answered questions
  const answeredCount = Object.keys(answers).filter(
    (key) => answers[key] !== undefined && answers[key] !== ""
  ).length;

  // ---- UI ----
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 space-y-4">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-32 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </Card>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-6">
          <div className="flex flex-col items-center space-y-3 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-semibold">Error Loading Exam</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => router.push("/student/examinations")}>
              Back to Examinations
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentAttempt || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-6">
          <div className="flex flex-col items-center space-y-3 text-center">
            <BookOpen className="w-12 h-12 text-gray-400" />
            <h3 className="text-lg font-semibold">Exam Not Found</h3>
            <p className="text-sm text-muted-foreground">
              The exam attempt could not be loaded.
            </p>
            <Button onClick={() => router.push("/student/examinations")}>
              Back to Examinations
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="mb-4 md:mb-6 bg-white rounded-lg shadow-sm p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                {currentAttempt.examPaper.exam.title}
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {currentAttempt.examPaper.exam.status} • Max Marks:{" "}
                {currentAttempt.examPaper.maxMarks}
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-xs md:text-sm self-start sm:self-auto"
            >
              <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gray-50/50 p-4 md:p-6">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base md:text-lg">
                      Question {currentQuestionIndex + 1} of{" "}
                      {currentAttempt.questions.length}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {currentQuestion.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {currentQuestion.marks}{" "}
                        {currentQuestion.marks === 1 ? "mark" : "marks"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className="flex-shrink-0"
                  >
                    <Flag
                      className={`w-4 h-4 md:w-5 md:h-5 ${
                        flagged[currentQuestion.id]
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 md:p-6">
                <p className="text-sm md:text-base mb-6 leading-relaxed">
                  {currentQuestion.questionText}
                </p>

                <QuestionRenderer
                  question={currentQuestion}
                  answer={answers[currentQuestion.id]}
                  onAnswerChange={handleAnswerChange}
                />

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 pt-6 border-t">
                  <Button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="w-full sm:w-auto"
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
                      currentQuestionIndex ===
                      currentAttempt.questions.length - 1
                    }
                    className="w-full sm:w-auto"
                  >
                    Next
                  </CustomButton>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Timer Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-sm md:text-base flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Remaining
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl md:text-3xl font-bold text-center text-blue-600 tracking-wide">
                  {formatTime(timeLeft)}
                </div>
                <Progress
                  value={timePercent}
                  className={`h-2 rounded-full ${progressColor}`}
                />
                <p className="text-xs text-center text-gray-500">
                  {Math.round(timePercent)}% remaining
                </p>
              </CardContent>
            </Card>

            {/* Question Navigation */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base">
                  Question Navigation
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {answeredCount} of {currentAttempt.questions.length} answered
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-5 gap-2">
                {currentAttempt.questions.map((q, index) => {
                  const isCurrent = currentQuestionIndex === index;
                  const isAnswered =
                    answers[q.id] !== undefined && answers[q.id] !== "";
                  const isFlagged = flagged[q.id];

                  let buttonClass = "border-gray-300 hover:bg-gray-100";
                  if (isCurrent) {
                    buttonClass = "bg-blue-600 text-white hover:bg-blue-700";
                  } else if (isAnswered) {
                    buttonClass =
                      "bg-green-100 text-green-700 hover:bg-green-200";
                  }

                  return (
                    <Button
                      key={q.id}
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`relative h-9 w-full rounded-md text-xs md:text-sm ${buttonClass} ${
                        isFlagged ? "ring-2 ring-yellow-400" : ""
                      }`}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="h-2.5 w-2.5 absolute -top-1 -right-1 fill-yellow-500 text-yellow-500" />
                      )}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <CustomButton
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </CustomButton>

            {/* Instructions */}
            {currentAttempt.examPaper.instructions && (
              <Card className="shadow-sm bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-900">
                    <AlertCircle className="w-4 h-4" />
                    Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-blue-800">
                    {currentAttempt.examPaper.instructions}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Unanswered Questions
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have{" "}
              <span className="font-semibold text-yellow-600">
                {
                  currentAttempt?.questions.filter(
                    (q) => !answers[q.id] || answers[q.id] === ""
                  ).length
                }
              </span>{" "}
              unanswered question
              {currentAttempt?.questions.filter(
                (q) => !answers[q.id] || answers[q.id] === ""
              ).length !== 1
                ? "s"
                : ""}
              . Are you sure you want to submit your exam? You won&apos;t be
              able to make changes after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Review Answers
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={proceedWithSubmission}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Anyway"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default withAuth(CBTPage, [UserRole.STUDENT]);
