"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { useStudentExamStore } from '@/store/studentExamStore';
import { createAndfetchExamAttempt, saveAnswer, submitExam } from '@/services/examService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Flag } from 'lucide-react';
import { Question } from '@/types/exam';
import { useAuthStore } from '@/store/authStore';

const QuestionRenderer = ({ question, answer, onAnswerChange }: { question: Question, answer: any, onAnswerChange: (id: string, answer: any) => void }) => {
    switch (question.type) {
        case 'MCQ':
            return (
              <RadioGroup onValueChange={(value) => onAnswerChange(question.id, value)} value={answer}>
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(index)} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            );
        case 'Essay':
            return (
              <Textarea
                rows={10}
                value={answer || ''}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
              />
            );
        case 'TrueFalse':
            return (
                <RadioGroup onValueChange={(value) => onAnswerChange(question.id, value === 'true')} value={String(answer)}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="true" />
                        <Label htmlFor="true">True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="false" />
                        <Label htmlFor="false">False</Label>
                    </div>
                </RadioGroup>
            );
        case 'FillInBlanks':
            return (
              <Input
                value={answer || ''}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
              />
            );
        default:
            return <p>Unsupported question type: {question.type}</p>;
    }
};


const CBTPage = () => {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const { currentAttempt, fetchExamAttempt, loading, error } = useStudentExamStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dirtyAnswers, setDirtyAnswers] = useState<Set<string>>(new Set());
  const {selectedSchool} = useAuthStore()

  useEffect(() => {
    if (attemptId) {
      createAndfetchExamAttempt(attemptId, selectedSchool?.schoolId);
    }
  }, [attemptId, fetchExamAttempt, selectedSchool?.schoolId]);

  useEffect(() => {
    if (currentAttempt) {
      const durationInSeconds = (new Date(currentAttempt.attempt.examPaper.endTime).getTime() - new Date(currentAttempt.attempt.examPaper.startTime).getTime()) / 1000;
      const startTime = new Date(currentAttempt.attempt.startedAt).getTime();
      const now = new Date().getTime();
      const elapsed = (now - startTime) / 1000;
      setTimeLeft(Math.max(0, durationInSeconds - elapsed));
    }
  }, [currentAttempt]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitExam(attemptId);
      toast.success("Exam submitted successfully!");
      router.push('/student/examinations');
    } catch (error) {
      toast.error("Failed to submit exam.");
      setIsSubmitting(false);
    }
  }, [attemptId, router, isSubmitting]);

  useEffect(() => {
    if (timeLeft <= 0 && currentAttempt) {
        handleSubmit();
        return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentAttempt, handleSubmit]);

  const currentQuestion = useMemo(() => {
    return currentAttempt?.questions[currentQuestionIndex];
  }, [currentAttempt, currentQuestionIndex]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (dirtyAnswers.size > 0) {
        const responsesToSave = Array.from(dirtyAnswers).map(questionId => ({
          questionId,
          studentAnswer: answers[questionId],
        }));

        saveAnswer(attemptId, responsesToSave).then((res) => {
          if(res.success) {
            setDirtyAnswers(new Set());
            toast.success("Progress saved!");
          } else {
            toast.error(res.message || "Failed to save some answers.");
          }
        }).catch(() => {
            toast.error("An error occurred while saving. Please check your connection.")
        })
      }
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [answers, attemptId, dirtyAnswers]);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setDirtyAnswers(prev => new Set(prev).add(questionId));
  };

  const toggleFlag = (questionId: string) => {
    setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  if (loading) return <p>Loading exam...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!currentAttempt) return <p>Exam attempt not found.</p>;

  return (
    <div className="flex gap-6 p-4">
      <div className="flex-grow">
        <Card>
          <CardHeader>
            <CardTitle>{currentAttempt.attempt.examPaper.exam.title}</CardTitle>
            <div className="flex justify-between items-center">
                <CardDescription>Question {currentQuestionIndex + 1} of {currentAttempt.questions.length}</CardDescription>
                <Button variant="ghost" size="icon" onClick={() => toggleFlag(currentQuestion.id)}>
                    <Flag className={flagged[currentQuestion.id] ? "text-yellow-500" : ""} />
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-semibold mb-4">{currentQuestion.questionText}</p>
            <QuestionRenderer
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswerChange={handleAnswerChange}
            />
          </CardContent>
        </Card>
        <div className="flex justify-between mt-6">
          <Button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>Previous</Button>
          <Button onClick={() => setCurrentQuestionIndex(prev => Math.min(currentAttempt.questions.length - 1, prev + 1))} disabled={currentQuestionIndex === currentAttempt.questions.length - 1}>Next</Button>
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
                {currentAttempt.questions.map((q, index) => (
                    <Button
                        key={q.id}
                        variant={currentQuestionIndex === index ? 'default' : (answers[q.id] !== undefined ? 'secondary' : 'outline')}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`h-10 w-10 relative ${flagged[q.id] ? 'border-2 border-yellow-500' : ''}`}
                    >
                        {index + 1}
                        {flagged[q.id] && <Flag className="h-3 w-3 absolute top-1 right-1 text-yellow-500" />}
                    </Button>
                ))}
            </CardContent>
        </Card>
        <Button className="w-full mt-6" variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
        </Button>
      </div>
    </div>
  );
};

export default withAuth(CBTPage, [UserRole.STUDENT]);