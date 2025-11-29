"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Student } from "@/types/student";
import { CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Attempt, ExamPaper } from "@/types/exam";
import { Badge } from "@/components/ui/badge";

interface ResultsTableProps {
  paper: ExamPaper;
  students: Student[];
  scores: { [studentId: string]: number };
  onScoreChange: (studentId: string, value: number) => void;
}

export const ResultsTable = ({
  paper,
  students,
  scores,
  onScoreChange,
}: ResultsTableProps) => {
  const { showToast } = useToast();
  const getAttemptForStudent = (studentId: string) => {
    return paper.attempts?.find(
      (attempt: Attempt) => attempt.studentId === studentId
    );
  };

  const getScoreColor = (score: number, maxMarks: number) => {
    const percentage = (score / maxMarks) * 100;
    if (percentage >= 70) return "text-green-600 font-semibold";
    if (percentage >= 50) return "text-blue-600 font-semibold";
    if (percentage >= 40) return "text-orange-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No students found in this section.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="min-w-[200px]">Student Name</TableHead>
            <TableHead className="w-32">Admission No.</TableHead>
            <TableHead className="w-32 text-center">
              Score
              <br />
              <span className="text-xs font-normal text-muted-foreground">
                (Max: {paper.maxMarks})
              </span>
            </TableHead>
            <TableHead className="w-24 text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => {
            const studentId = student?.studentId || "";
            const attempt = getAttemptForStudent(studentId);

            // Get current score: use state value if available, otherwise use attempt score
            const stateScore = scores[studentId];
            const attemptScore = attempt?.totalScore;
            const currentScore =
              stateScore !== undefined ? stateScore : attemptScore || "";

            // Determine if student has been graded
            const hasScore =
              (currentScore !== "" &&
                currentScore !== undefined &&
                currentScore !== null) ||
              attempt?.status === "Graded";

            return (
              <TableRow key={studentId} className="hover:bg-muted/30">
                <TableCell className="font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {student.admissionNumber}
                </TableCell>
                <TableCell className="text-center">
                  {paper.mode === "PaperBased" ? (
                    <Input
                      type="number"
                      min={0}
                      max={paper.maxMarks}
                      value={currentScore}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === "" ? 0 : Number(value);

                        if (numValue <= paper.maxMarks) {
                          onScoreChange(studentId, numValue);
                        } else {
                          showToast({
                            type: "error",
                            title: "Error",
                            message: `Score cannot exceed ${paper.maxMarks}`,
                          });
                        }
                      }}
                      className="w-20 text-center"
                      placeholder="0"
                    />
                  ) : (
                    <span
                      className={
                        hasScore
                          ? getScoreColor(Number(currentScore), paper.maxMarks)
                          : "text-muted-foreground"
                      }
                    >
                      {hasScore ? `${currentScore}/${paper.maxMarks}` : "—"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {hasScore ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Graded
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <Circle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
