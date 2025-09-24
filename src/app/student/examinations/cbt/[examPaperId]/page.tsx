"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useExamStore from "@/store/examStore";
import { examinationService } from "@/services/examinationService";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import ExamHeader from "@/components/student-dashboard/cbt/ExamHeader";
import QuestionPanel from "@/components/student-dashboard/cbt/QuestionPanel";
import QuestionNavigation from "@/components/student-dashboard/cbt/QuestionNavigation";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const CBTPage = () => {
  const params = useParams();
  const examPaperId = params.examPaperId as string;
  const router = useRouter();
  const { toast } = useToast();
  const {
    examPaper,
    answers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setExamAttempt,
    reset,
    attemptId,
    remainingTime
  } = useExamStore();

  useEffect(() => {
    const startExam = async () => {
      if (!examPaperId) return;
      try {
        const paperResponse = await examinationService.getExamPaper(examPaperId);
        if (paperResponse.success) {
          const attemptResponse = await examinationService.startExamAttempt(examPaperId);
          if (attemptResponse.success && attemptResponse.data) {
            setExamAttempt(paperResponse.data, attemptResponse.data.id);
          } else {
            toast({ title: "Error", description: "Failed to start exam attempt.", variant: "destructive" });
            router.push('/student/examinations');
          }
        } else {
          toast({ title: "Error", description: "Failed to load exam paper.", variant: "destructive" });
          router.push('/student/examinations');
        }
      } catch (error) {
        toast({ title: "Error", description: "An error occurred while starting the exam.", variant: "destructive" });
        router.push('/student/examinations');
      }
    };

    startExam();

    return () => {
      reset();
    };
  }, [examPaperId, setExamAttempt, reset, toast, router]);

  useEffect(() => {
    if (remainingTime > 0 && remainingTime % 10 === 0) {
        if (attemptId && answers.size > 0) {
            answers.forEach((answer, questionId) => {
              examinationService.saveResponse(attemptId, { questionId, answer: answer as any });
            });
        }
    }
  }, [remainingTime, attemptId, answers]);

  useEffect(() => {
    if (remainingTime === 0 && attemptId) {
      handleSubmit();
    }
  }, [remainingTime, attemptId]);

  const handleSubmit = async () => {
    if (!attemptId) return;
    try {
      await examinationService.submitExam(attemptId);
      toast({ title: "Success", description: "Exam submitted successfully!" });
      router.push('/student/examinations');
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit exam.", variant: "destructive" });
    }
  };

  const currentQuestion = examPaper?.questions[currentQuestionIndex];

  if (!examPaper || !currentQuestion) {
    return <div className="flex justify-center items-center h-screen"><Loader /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <ExamHeader />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <QuestionPanel question={currentQuestion} />
        </main>
        <aside className="hidden lg:block w-80 overflow-y-auto">
          <QuestionNavigation />
        </aside>
      </div>
      <footer className="p-4 border-t flex justify-between items-center bg-card">
        <div>
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="ml-2"
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            disabled={currentQuestionIndex === examPaper.questions.length - 1}
          >
            Next
          </Button>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Submit Exam</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
              <AlertDialogDescription>
                You will not be able to change your answers after submitting.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </footer>
    </div>
  );
};

export default withAuth(CBTPage, [UserRole.STUDENT]);
