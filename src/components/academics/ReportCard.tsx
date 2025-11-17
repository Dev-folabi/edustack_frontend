
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ReportCard = ({ report }: { report: any }) => {
  const {
    schoolInfo,
    studentInfo,
    termInfo,
    performance,
    attendance,
    affectiveTraits,
    remarks,
  } = report;

  return (
    <Card className="p-4">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{schoolInfo.name}</CardTitle>
        <p>{schoolInfo.address}</p>
        <p>Email: {schoolInfo.email} | Phone: {schoolInfo.phone.join(", ")}</p>
        <p className="font-bold">{schoolInfo.motto}</p>
      </CardHeader>
      <CardContent>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Student Name:</strong> {studentInfo.name}</p>
            <p><strong>Admission No:</strong> {studentInfo.admissionNumber}</p>
            <p><strong>Class:</strong> {studentInfo.class} {studentInfo.section}</p>
          </div>
          <div>
            <p><strong>Session:</strong> {termInfo.session}</p>
            <p><strong>Term:</strong> {termInfo.term}</p>
            <p><strong>Gender:</strong> {studentInfo.gender}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <h3 className="text-lg font-bold mb-2">Academic Performance</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>1st CA</TableHead>
              <TableHead>2nd CA</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performance.academic.map((subject: any) => (
              <TableRow key={subject.name}>
                <TableCell>{subject.name}</TableCell>
                <TableCell>{subject.scores.find((s: any) => s.title === "1st CA")?.score || "N/A"}</TableCell>
                <TableCell>{subject.scores.find((s: any) => s.title === "2nd CA")?.score || "N/A"}</TableCell>
                <TableCell>{subject.scores.find((s: any) => s.title === "Final Exam")?.score || "N/A"}</TableCell>
                <TableCell>{subject.total}</TableCell>
                <TableCell>{subject.grade}</TableCell>
                <TableCell>{subject.remark}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-bold mb-2">Summary</h3>
            <p><strong>Total Marks:</strong> {performance.summary.totalMarks} / {performance.summary.maxMarks}</p>
            <p><strong>Percentage:</strong> {performance.summary.percentage}%</p>
            <p><strong>Grade:</strong> {performance.summary.grade}</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Attendance</h3>
            <p><strong>Present:</strong> {attendance.present}</p>
            <p><strong>Absent:</strong> {attendance.absent}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <div>
          <h3 className="text-lg font-bold mb-2">Affective Traits</h3>
          <div className="flex space-x-4">
            {affectiveTraits.map((trait: any) => (
              <div key={trait.name}>
                <strong>{trait.name}:</strong> {trait.rating}
              </div>
            ))}
          </div>
        </div>
        <Separator className="my-4" />
        <div>
          <h3 className="text-lg font-bold mb-2">Remarks</h3>
          <p><strong>Teacher's Remark:</strong> {remarks.teacher}</p>
          <p><strong>Principal's Remark:</strong> {remarks.principal}</p>
        </div>
      </CardContent>
    </Card>
  );
};
