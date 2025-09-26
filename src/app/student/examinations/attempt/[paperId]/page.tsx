"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { getExamPaperById } from "@/services/examService";
import { ExamPaper } from "@/types/exam";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  AlertTriangle,
  Info,
  Check,
  Clock,
  Award,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { BackButton } from "@/components/ui/BackButton";

const PreAttemptPage = () => {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const paperId = params.paperId as string;

  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (paperId) {
      const fetchPaperDetails = async () => {
        try {
          setLoading(true);
          const response = await getExamPaperById(paperId);
          if (response.success) {
            setPaper(response.data);
          } else {
            setError(response.message || "Failed to fetch exam details.");
          }
        } catch (err) {
          setError("An unexpected error occurred.");
        } finally {
          setLoading(false);
        }
      };
      fetchPaperDetails();
    }
  }, [paperId]);

  const handleStartExam = async () => {
    if (!paper) return;
    setIsStarting(true);
    showToast({
      title: "",
      message: "Starting up exam! Good luck.",
      type: "success",
    });
    router.push(`/student/examinations/cbt/${paper.id}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading Exam Details...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <AlertTriangle className="mr-2" />
        {error}
      </div>
    );
  if (!paper)
    return (
      <div className="flex justify-center items-center h-screen">
        No exam paper found.
      </div>
    );

  const duration =
    (new Date(paper.endTime).getTime() - new Date(paper.startTime).getTime()) /
    60000;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <BackButton />
            <div className="text-center flex-grow">
              <CardTitle className="text-2xl mb-2">
                {paper.exam.title}
              </CardTitle>
              <p className="text-lg text-gray-700">{paper.subject.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              Instructions
            </h3>
            <p className="mt-2 text-gray-700">
              {paper.instructions ||
                "No specific instructions provided. Read all questions carefully."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-100 rounded-lg">
              <Clock className="mx-auto h-8 w-8 text-gray-600 mb-2" />
              <p className="font-bold">Duration</p>
              <p>{duration} minutes</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <Award className="mx-auto h-8 w-8 text-gray-600 mb-2" />
              <p className="font-bold">Max Marks</p>
              <p>{paper.maxMarks}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <Check className="mx-auto h-8 w-8 text-gray-600 mb-2" />
              <p className="font-bold">Total Questions</p>
              <p>{paper.totalQuestions}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {paper.mode === "CBT" ? (
            <Button size="lg" onClick={handleStartExam} disabled={isStarting}>
              {isStarting ? "Starting Exam..." : "Start CBT Exam"}
            </Button>
          ) : (
            <p className="text-center text-gray-600">
              This is a paper-based test. Please follow instructions from your
              examiner.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default withAuth(PreAttemptPage, [UserRole.STUDENT]);
