"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, GraduationCap } from "lucide-react";

interface ExamCardProps {
  exam: any;
  paper?: any;
  status: string;
}

export const ExamCard = ({ exam, paper, status }: ExamCardProps) => {
  const router = useRouter();

  // Compute duration only if paper has times
  const duration =
    paper?.startTime && paper?.endTime
      ? (new Date(paper.endTime).getTime() -
          new Date(paper.startTime).getTime()) /
        60000
      : null;

  const handleStartExam = async () => {
    if (!paper?.id) return;
    const paperId = paper?.id;
    router.push(`/student/examinations/cbt/${paperId}`);
  };

  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{exam.title}</CardTitle>
        <p className="text-sm text-gray-500">
          {exam.class?.name} {exam.section?.name} • {exam.term?.name} •{" "}
          {exam.session?.name}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {paper ? (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <GraduationCap size={16} />
              <span>{paper.subject?.name ?? "Unknown Subject"}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              <span>
                {new Date(paper.paperDate).toLocaleDateString()} •{" "}
                {new Date(paper.startTime).toLocaleTimeString()} -{" "}
                {new Date(paper.endTime).toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} />
              <span>
                Duration:{" "}
                {duration !== null ? `${duration} minutes` : "Not specified"}
              </span>
            </div>

            <div className="flex justify-between items-center mt-2">
              <Badge variant={paper.mode === "CBT" ? "default" : "secondary"}>
                {paper.mode ?? "Unknown Mode"}
              </Badge>
              <span className="text-sm">Marks: {paper.maxMarks ?? "--"}</span>
            </div>
          </>
        ) : (
          <p className="text-sm italic text-gray-500">
            No papers assigned for this exam.
          </p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Badge
          className={`${
            status === "Ongoing"
              ? "bg-green-500"
              : status === "Scheduled"
              ? "bg-blue-500"
              : status === "Completed"
              ? "bg-gray-500"
              : "bg-red-500"
          }`}
        >
          {status}
        </Badge>

        {paper ? (
          <>
            {status === "Ongoing" && paper.mode === "CBT" ? (
              <Button size="sm" variant="outline" onClick={handleStartExam}>
                {"Start Exam"}
              </Button>
            ) : status === "Completed" ? (
              <Button size="sm" variant="outline">
                View Result
              </Button>
            ) : null}
          </>
        ) : (
          <Button size="sm" variant="outline" disabled>
            Not Available
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
