"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReportCardProps {
  data: any;
}

export const ReportCard = ({ data }: ReportCardProps) => {
  if (!data) return null;

  return (
    <Card className="w-full max-w-4xl mx-auto p-4" id="report-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={data.school?.logoUrl} alt="School Logo" />
            <AvatarFallback>{data.school?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-blue-800">
              {data.school?.name}
            </h1>
            <p>{data.school?.address}</p>
          </div>
        </div>
        <Avatar className="h-24 w-24">
          <AvatarImage src={data.studentInfo?.photoUrl} alt="Student Photo" />
          <AvatarFallback>{data.studentInfo?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="text-center py-2">
        <p className="font-semibold italic">{data.school?.motto}</p>
      </div>
      <div className="text-center py-2 bg-gray-200 font-bold">
        <p>{data.term?.toUpperCase()} REPORT SHEET</p>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b">
        <div>
          <span className="font-semibold">Name of Pupil:</span>{" "}
          {data.studentInfo?.name}
        </div>
        <div>
          <span className="font-semibold">Class:</span>{" "}
          {data.academicInfo?.class}
        </div>
        <div>
          <span className="font-semibold">Registration No:</span>{" "}
          {data.studentInfo?.admissionNumber}
        </div>
        <div>
          <span className="font-semibold">Session:</span>{" "}
          {data.academicInfo?.session}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b">
        <div>
          <span className="font-semibold">Times School Opened:</span>{" "}
          {data.summary?.timesOpened}
        </div>
        <div>
          <span className="font-semibold">Times Present:</span>{" "}
          {data.summary?.timesPresent}
        </div>
        <div>
          <span className="font-semibold">Times Absent:</span>{" "}
          {data.summary?.timesAbsent}
        </div>
        <div>
          <span className="font-semibold">Overall Grade:</span>{" "}
          {data.summary?.overallGrade}
        </div>
      </div>

      {/* Academic Performance */}
      <h2 className="text-center bg-blue-800 text-white font-bold p-1 my-4">
        STUDENT'S ACADEMIC PERFORMANCE
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SUBJECT</TableHead>
            <TableHead>MARKS OBTAINED</TableHead>
            <TableHead>MAX MARKS</TableHead>
            <TableHead>PERCENTAGE</TableHead>
            <TableHead>GRADE</TableHead>
            <TableHead>REMARKS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.results?.map(
            (
              item: {
                subject: string;
                marksObtained: number;
                maxMarks: number;
                percentage: number;
                grade: string;
                remark: string;
              },
              index: number
            ) => (
              <TableRow key={index}>
                <TableCell>{item.subject}</TableCell>
                <TableCell>{item.marksObtained}</TableCell>
                <TableCell>{item.maxMarks}</TableCell>
                <TableCell>{item.percentage}%</TableCell>
                <TableCell>{item.grade}</TableCell>
                <TableCell>{item.remark}</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>

      {/* Affective Traits & Keys */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <div>
          <h2 className="text-center bg-blue-800 text-white font-bold p-1 my-4">
            AFFECTIVE TRAITS
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TRAIT</TableHead>
                <TableHead>RATING</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.psychomotor?.map(
                (
                  item: { name: string; rating: string | number },
                  index: number
                ) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.rating}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
        <div>
          <h2 className="text-center bg-blue-800 text-white font-bold p-1 my-4">
            KEYS TO GRADING
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RANGE</TableHead>
                <TableHead>GRADE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.gradeCriteria?.map(
                (
                  item: { minScore: number; maxScore: number; name: string },
                  index: number
                ) => (
                  <TableRow key={index}>
                    <TableCell>
                      {item.minScore}-{item.maxScore}
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-4 space-y-2">
        <div>
          <span className="font-semibold">Teacher's Comment:</span>{" "}
          {data.remarks?.classTeacher}
        </div>
        <div>
          <span className="font-semibold">Principal's Comment:</span>{" "}
          {data.remarks?.schoolHead}
        </div>
      </div>
    </Card>
  );
};
