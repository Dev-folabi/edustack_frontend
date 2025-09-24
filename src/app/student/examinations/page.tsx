"use client";

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { examinationService, ExamFilters } from '@/services/examinationService';
import { Exam, ExamStatus } from '@/types/examination';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import ExamCard from '@/components/student-dashboard/ExamCard';
import { Loader } from '@/components/ui/Loader';

const StudentExaminationsPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ExamStatus>(ExamStatus.UPCOMING);

  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      try {
        const response = await examinationService.getExams({ status: activeTab });
        if (response.success) {
          setExams(response.data.exams);
        }
      } catch (error) {
        console.error('Failed to fetch exams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, [activeTab]);

  const renderExams = () => {
    if (isLoading) {
      return <div className='flex justify-center items-center h-40'><Loader /></div>;
    }

    if (exams.length === 0) {
      return <p className="text-center text-muted-foreground mt-8">No exams found in this category.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Examinations</h1>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ExamStatus)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value={ExamStatus.UPCOMING}>Upcoming</TabsTrigger>
          <TabsTrigger value={ExamStatus.ONGOING}>Ongoing</TabsTrigger>
          <TabsTrigger value={ExamStatus.COMPLETED}>Completed</TabsTrigger>
          <TabsTrigger value={ExamStatus.RESULT_PUBLISHED}>Results</TabsTrigger>
        </TabsList>
        <TabsContent value={ExamStatus.UPCOMING}>{renderExams()}</TabsContent>
        <TabsContent value={ExamStatus.ONGOING}>{renderExams()}</TabsContent>
        <TabsContent value={ExamStatus.COMPLETED}>{renderExams()}</TabsContent>
        <TabsContent value={ExamStatus.RESULT_PUBLISHED}>{renderExams()}</TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(StudentExaminationsPage, [UserRole.STUDENT, UserRole.PARENT]);
