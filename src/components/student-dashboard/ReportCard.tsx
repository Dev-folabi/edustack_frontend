"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
                    <h1 className="text-2xl font-bold text-blue-800">{data.school?.name}</h1>
                    <p>{data.school?.address}</p>
                </div>
            </div>
            <Avatar className="h-24 w-24">
                <AvatarImage src={data.student?.photoUrl} alt="Student Photo" />
                <AvatarFallback>{data.student?.name?.charAt(0)}</AvatarFallback>
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
            <div><span className="font-semibold">Name of Pupil:</span> {data.student?.name}</div>
            <div><span className="font-semibold">Class:</span> {data.student?.class}</div>
            <div><span className="font-semibold">Registration No:</span> {data.student?.registrationNumber}</div>
            <div><span className="font-semibold">Session:</span> {data.student?.session}</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b">
            <div><span className="font-semibold">Times School Opened:</span> {data.timesOpened}</div>
            <div><span className="font-semibold">Times Present:</span> {data.timesPresent}</div>
            <div><span className="font-semibold">Times Absent:</span> {data.timesAbsent}</div>
        </div>

        {/* Academic Performance */}
        <h2 className="text-center bg-blue-800 text-white font-bold p-1 my-4">STUDENT'S ACADEMIC PERFORMANCE</h2>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>SUBJECT</TableHead>
                    <TableHead>1ST CA (10)</TableHead>
                    <TableHead>2ND CA (20)</TableHead>
                    <TableHead>EXAM (70)</TableHead>
                    <TableHead>TOTAL (100)</TableHead>
                    <TableHead>GRADE</TableHead>
                    <TableHead>REMARKS</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.academicPerformance?.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell>{item.subject}</TableCell>
                        <TableCell>{item.ca1}</TableCell>
                        <TableCell>{item.ca2}</TableCell>
                        <TableCell>{item.exam}</TableCell>
                        <TableCell>{item.total}</TableCell>
                        <TableCell>{item.grade}</TableCell>
                        <TableCell>{item.remarks}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

        {/* Affective Traits & Keys */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div>
                 <h2 className="text-center bg-blue-800 text-white font-bold p-1 my-4">AFFECTIVE TRAITS</h2>
                 <Table>
                    <TableHeader><TableRow><TableHead>TRAIT</TableHead><TableHead>RATING</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {data.affectiveTraits?.map((item, index) => (
                            <TableRow key={index}><TableCell>{item.trait}</TableCell><TableCell>{item.rating}</TableCell></TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </div>
            <div>
                <h2 className="text-center bg-blue-800 text-white font-bold p-1 my-4">KEYS TO GRADING</h2>
                <Table>
                    <TableHeader><TableRow><TableHead>RANGE</TableHead><TableHead>GRADE</TableHead><TableHead>INTERPRETATION</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {data.keysToGrading?.map((item, index) => (
                             <TableRow key={index}><TableCell>{item.range}</TableCell><TableCell>{item.grade}</TableCell><TableCell>{item.interpretation}</TableCell></TableRow>
                        ))}
                    </TableBody>
                </Table>
                <h2 className="text-center bg-blue-800 text-white font-bold p-1 my-4">KEYS TO RATING</h2>
                 <Table>
                    <TableHeader><TableRow><TableHead>RATING</TableHead><TableHead>INTERPRETATION</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {data.keysToRating?.map((item, index) => (
                             <TableRow key={index}><TableCell>{item.rating}</TableCell><TableCell>{item.interpretation}</TableCell></TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>

        {/* Comments */}
        <div className="mt-4 space-y-2">
            <div><span className="font-semibold">Teacher's Comment:</span> {data.teacherComment}</div>
            <div><span className="font-semibold">Principal's Comment:</span> {data.principalComment}</div>
        </div>
    </Card>
  );
};