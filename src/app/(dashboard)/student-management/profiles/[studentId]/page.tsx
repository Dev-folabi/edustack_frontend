"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { studentService } from '@/services/studentService';
import { Student } from '@/types/student';
import { useAuth } from '@/store/authStore';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ADMINS_ROLES } from '@/constants/roles';
import { sessionService, Session, Term } from '@/services/sessionService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const StudentProfilePage = () => {
  const params = useParams();
  const { user } = useAuth();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const canDownloadReport = user && ADMINS_ROLES.includes(user.role);

  useEffect(() => {
    if (studentId) {
      studentService.getStudentById(studentId)
        .then(res => setStudent(res.data.student))
        .catch(err => toast.error(err.message || "Failed to fetch student details."))
        .finally(() => setIsLoading(false));
    }
    if (canDownloadReport) {
      sessionService.getSessions()
        .then(res => setSessions(res.data.data));
    }
  }, [studentId, canDownloadReport]);

  useEffect(() => {
    if (selectedSessionId) {
      const selectedSession = sessions.find(s => s.id === selectedSessionId);
      setTerms(selectedSession?.terms || []);
      setSelectedTermId('');
    }
  }, [selectedSessionId, sessions]);

  const handleDownloadReport = async () => {
    if (!selectedSessionId || !selectedTermId) {
      toast.error("Please select a session and term to generate the report.");
      return;
    }
    setIsDownloading(true);
    try {
      const blob = await studentService.getStudentTermReport(studentId, selectedTermId, selectedSessionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${student?.name}_term_report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to download report.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!student) {
    return <div className="container mx-auto p-4">Student not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={student.photo_url} alt={student.name} />
            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl">{student.name}</CardTitle>
            <p className="text-muted-foreground">Admission No: {student.admission_number}</p>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><span className="font-semibold">Email:</span> {student.email}</div>
          <div><span className="font-semibold">Username:</span> {student.username}</div>
          <div><span className="font-semibold">Phone:</span> {student.phone}</div>
          <div><span className="font-semibold">Gender:</span> {student.gender}</div>
          <div><span className="font-semibold">Date of Birth:</span> {new Date(student.dob).toLocaleDateString()}</div>
          <div><span className="font-semibold">Religion:</span> {student.religion}</div>
          <div><span className="font-semibold">Blood Group:</span> {student.blood_group || 'N/A'}</div>
          <div><span className="font-semibold">Address:</span> {student.address}</div>
          <div><span className="font-semibold">City:</span> {student.city || 'N/A'}</div>
          <div><span className="font-semibold">State:</span> {student.state || 'N/A'}</div>
          <div><span className="font-semibold">Country:</span> {student.country || 'N/A'}</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Academic Details</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-semibold">Admission Date:</span> {new Date(student.admission_date).toLocaleDateString()}</p>
            <p><span className="font-semibold">Class:</span> {student.class.name}</p>
            <p><span className="font-semibold">Section:</span> {student.section.name}</p>
            <p><span className="font-semibold">Status:</span> {student.isActive ? 'Active' : 'Inactive'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Parent Details</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-semibold">Father's Name:</span> {student.father_name}</p>
            <p><span className="font-semibold">Father's Occupation:</span> {student.father_occupation}</p>
            <p><span className="font-semibold">Mother's Name:</span> {student.mother_name}</p>
            <p><span className="font-semibold">Mother's Occupation:</span> {student.mother_occupation}</p>
          </CardContent>
        </Card>
      </div>

      {canDownloadReport && (
        <Card>
          <CardHeader><CardTitle>Generate Report</CardTitle></CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Select onValueChange={setSelectedSessionId} value={selectedSessionId}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Session" /></SelectTrigger>
              <SelectContent>{sessions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select onValueChange={setSelectedTermId} value={selectedTermId} disabled={!selectedSessionId}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Term" /></SelectTrigger>
              <SelectContent>{terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={handleDownloadReport} disabled={isDownloading || !selectedTermId}>
              {isDownloading ? "Downloading..." : "Download Report (PDF)"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default withAuth(StudentProfilePage, [UserRole.ADMIN, UserRole.TEACHER]);
