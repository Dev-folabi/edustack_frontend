"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getExamById, addManualMarks, addPsychomotor, getPsychomotorSkills } from '@/services/exam.service';
import { studentService } from '@/services/studentService';
import { IExam, IPsychomotorSkill } from '@/types/exam.type';
import { Student } from '@/types/student';
import { useSession } from 'next-auth/react';

const AddResultPage = () => {
  const { examId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [exam, setExam] = useState<IExam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<{ [studentId: string]: { [paperId: string]: number } }>({});
  const [psychomotorScores, setPsychomotorScores] = useState<{ [studentId: string]: { [skillId: string]: number } }>({});
  const [psychomotorSkills, setPsychomotorSkills] = useState<IPsychomotorSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof examId === 'string') {
        const examDetails = await getExamById(examId);
        setExam(examDetails);

        if (examDetails && session?.user.schoolId) {
          const studentRes = await studentService.getStudentsBySection(session.user.schoolId, { sectionId: examDetails.sectionId });
          setStudents(studentRes.data.data);
        }

        const psychomotorRes = await getPsychomotorSkills();
        setPsychomotorSkills(psychomotorRes.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [examId, session]);

  const handleScoreChange = (studentId: string, paperId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [paperId]: parseInt(value, 10) || 0,
      },
    }));
  };

  const handlePsychomotorChange = (studentId: string, skillId: string, value: string) => {
    setPsychomotorScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [skillId]: parseInt(value, 10) || 0,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!exam) return;

    // TODO: Add proper validation and error handling
    for (const studentId in scores) {
      for (const paperId in scores[studentId]) {
        await addManualMarks({
          examPaperId: paperId,
          studentId,
          totalScore: scores[studentId][paperId],
          remarks: 'Submitted by admin',
        });
      }
    }

    if (Object.keys(psychomotorScores).length > 0) {
        const assessments = Object.keys(psychomotorScores).map(studentId => ({
            studentId,
            termId: exam.termId,
            sessionId: exam.sessionId,
            classId: exam.classId,
            sectionId: exam.sectionId,
            skillAssessments: Object.keys(psychomotorScores[studentId]).map(skillId => ({
                skillId,
                score: psychomotorScores[studentId][skillId]
            }))
        }));
        await addPsychomotor({ assessments });
    }

    router.push('/dashboard/examinations/result-management');
  };

  if (loading) return <p>Loading...</p>;
  if (!exam) return <p>Exam not found.</p>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Result for: {exam.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                {exam.papers.map(paper => (
                  <TableHead key={paper.id}>{paper.subjectId} (Max: {paper.maxMarks})</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  {exam.papers.map(paper => (
                    <TableCell key={paper.id}>
                      <Input
                        type="number"
                        max={paper.maxMarks}
                        onChange={(e) => handleScoreChange(student.id, paper.id, e.target.value)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Accordion type="single" collapsible className="w-full mt-8">
            <AccordionItem value="psychomotor">
              <AccordionTrigger>Optional: Add Psychomotor Assessments</AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      {psychomotorSkills.map(skill => (
                        <TableHead key={skill.id}>{skill.name} (Max: {skill.maxScore})</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        {psychomotorSkills.map(skill => (
                          <TableCell key={skill.id}>
                            <Input
                              type="number"
                              max={skill.maxScore}
                              onChange={(e) => handlePsychomotorChange(student.id, skill.id, e.target.value)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit}>Submit Results</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withAuth(AddResultPage, [UserRole.ADMIN, UserRole.TEACHER]);