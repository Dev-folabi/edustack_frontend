"use client";

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
  remarks?: { [studentId: string]: string };
  onScoreChange: (studentId: string, value: number) => void;
  onRemarkChange?: (studentId: string, value: string) => void;
}

export const ResultsTable = ({
  paper,
  students,
  scores,
  remarks = {},
  onScoreChange,
  onRemarkChange,
}: ResultsTableProps) => {
  const { showToast } = useToast();
  const getAttemptForStudent = (studentId: string) => {
    return paper.attempts?.find(
      (attempt: Attempt) => attempt.studentId === studentId
    );
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
            <TableHead className="min-w-[200px]">Remark (Optional)</TableHead>
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
                </TableCell>
                <TableCell>
                  {onRemarkChange && (
                    <Input
                      type="text"
                      value={remarks[studentId] || ""}
                      onChange={(e) =>
                        onRemarkChange(studentId, e.target.value)
                      }
                      className="w-full"
                      placeholder="Enter remark (optional)"
                    />
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
