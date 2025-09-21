"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { useStudentExamStore } from '@/store/studentExamStore';
import { saveAnswer, submitExam } from '@/services/examService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const CBTPage = () => {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const { currentAttempt, fetchExamAttempt, loading, error } = useStudentExamStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (attemptId) {
      fetchExamAttempt(attemptId);
    }
  }, [attemptId, fetchExamAttempt]);

  const timeToSeconds = (timeStr: string) => {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  useEffect(() => {
    if (currentAttempt) {
      const durationInSeconds = timeToSeconds(currentAttempt.examPaper.duration);
      const startTime = new Date(currentAttempt.startTime).getTime();
      const now = new Date().getTime();
      const elapsed = (now - startTime) / 1000;
      setTimeLeft(Math.max(0, durationInSeconds - elapsed));
    }
  }, [currentAttempt]);

  useEffect(() => {
    if (timeLeft <= 0) {
        if(currentAttempt) handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const currentQuestion = useMemo(() => {
    return currentAttempt?.examPaper.questions[currentQuestionIndex];
  }, [currentAttempt, currentQuestionIndex]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        // This would ideally save all changed answers in one batch
        // For simplicity, we save the current answer
        const currentAnswer = answers[currentQuestion.id];
        if(currentAnswer !== undefined) {
            saveAnswer(attemptId, currentQuestion.id, currentAnswer);
        }
      }
    }, 15000); // Auto-save every 15 seconds
    return () => clearInterval(saveInterval);
  }, [answers, attemptId, currentQuestion]);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    try {
      await submitExam(attemptId);
      toast.success("Exam submitted successfully!");
      router.push('/student/examinations');
    } catch (error) {
      toast.error("Failed to submit exam.");
    }
  };

  if (loading) return <p>Loading exam...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!currentAttempt) return <p>Exam attempt not found.</p>;

  return (
    <div className="flex gap-6">
      <div className="flex-grow">
        <Card>
          <CardHeader>
            <CardTitle>{currentAttempt.examPaper.subject.name}</CardTitle>
            <CardDescription>Question {currentQuestionIndex + 1} of {currentAttempt.examPaper.questions.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-semibold mb-4">{currentQuestion.questionText}</p>
            {currentQuestion.type === 'MCQ' && (
              <RadioGroup onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(index)} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {currentQuestion.type === 'ESSAY' && (
              <Textarea
                rows={10}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              />
            )}
            {currentQuestion.type === 'FILL_IN_BLANKS' && (
              <Input
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              />
            )}
          </CardContent>
        </Card>
        <div className="flex justify-between mt-6">
          <Button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>Previous</Button>
          <Button onClick={() => setCurrentQuestionIndex(prev => Math.min(currentAttempt.examPaper.questions.length - 1, prev + 1))} disabled={currentQuestionIndex === currentAttempt.examPaper.questions.length - 1}>Next</Button>
        </div>
      </div>
      <div className="w-64 flex-shrink-0">
        <Card>
          <CardHeader>
            <CardTitle>Time Left</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {Math.floor(timeLeft / 3600)}:{String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </CardContent>
        </Card>
        <Card className="mt-6">
            <CardHeader><CardTitle>Questions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-5 gap-2">
                {currentAttempt.examPaper.questions.map((q, index) => (
                    <Button
                        key={q.id}
                        variant={currentQuestionIndex === index ? 'default' : (answers[q.id] !== undefined ? 'secondary' : 'outline')}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className="h-10 w-10"
                    >
                        {index + 1}
                    </Button>
                ))}
            </CardContent>
        </Card>
        <Button className="w-full mt-6" variant="destructive" onClick={handleSubmit}>Submit Exam</Button>
      </div>
    </div>
  );
};

export default withAuth(CBTPage, [UserRole.STUDENT]);
