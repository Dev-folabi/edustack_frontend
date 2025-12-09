"use client";

import { useRouter } from "next/navigation";
import { ExamPaper } from "@/types/exam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  FileEdit,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface ExamPaperListProps {
  papers: ExamPaper[];
}

export const ExamPaperList = ({ papers }: ExamPaperListProps) => {
  const router = useRouter();

  const handleManageResults = (paperId: string) => {
    router.push(`/examinations/results/${paperId}`);
  };

  if (papers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              No exam papers found
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search filters
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {papers.map((paper) => {
        const isPublished = paper.isResultPublished;
        const examDate = new Date(paper.paperDate);
        const startTime = new Date(paper.startTime);
        const endTime = new Date(paper.endTime);
        const isCBT = paper.mode === "CBT";

        return (
          <Card
            key={paper.id}
            className="hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 mt-1">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {paper.subject.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {paper.exam?.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={isCBT ? "default" : "secondary"}
                      className={
                        isCBT ? "bg-blue-600" : "bg-orange-100 text-orange-800"
                      }
                    >
                      {paper.mode}
                    </Badge>
                    <Badge variant="outline">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {paper.exam?.class?.name} {paper.exam?.section?.name}
                    </Badge>
                    <Badge variant="outline">{paper.subject.code}</Badge>
                    {isPublished ? (
                      <Badge variant="default" className="bg-green-600">
                        <Eye className="w-3 h-3 mr-1" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Unpublished
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleManageResults(paper.id)}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  <FileEdit className="w-4 h-4 mr-2" />
                  Manage Results
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Exam Date</p>
                    <p className="text-sm font-medium">
                      {format(examDate, "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">
                      {format(startTime, "h:mm a")} -{" "}
                      {format(endTime, "h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Max Marks</p>
                    <p className="text-sm font-medium">{paper.maxMarks}</p>
                  </div>
                </div>

                {isCBT && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Questions</p>
                      <p className="text-sm font-medium">
                        {paper.totalQuestions}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>
                      {paper.exam?.term?.name} • {paper.exam?.session?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      Created{" "}
                      {format(new Date(paper?.createdAt || ""), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
