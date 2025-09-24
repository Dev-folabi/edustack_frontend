"use client";

import { useState, useEffect } from 'react';
import { getEssayResponses, gradeEssayResponse } from '@/services/examService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface EssayGradingProps {
  paperId: string;
}

export const EssayGrading = ({ paperId }: EssayGradingProps) => {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEssayResponses(paperId);
        if (res.success) {
          setResponses(res.data);
        }
      } catch (err) {
        setError('Failed to fetch essay responses.');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [paperId]);

  const handleGrade = async (responseId: string) => {
    const mark = marks[responseId];
    if (mark === undefined) {
      toast.error("Please enter a mark.");
      return;
    }

    try {
      await gradeEssayResponse(responseId, mark);
      toast.success("Grade saved successfully!");
    } catch (error) {
      toast.error("Failed to save grade.");
    }
  };

  if (loading) return <p>Loading essay responses...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (responses.length === 0) return <p>No essay responses to grade for this paper.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Essay Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {responses.map(response => (
            <AccordionItem key={response.id} value={response.id}>
              <AccordionTrigger>
                {response.student.name} - {response.question.questionText}
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="border p-4 rounded-md bg-gray-50">{response.studentAnswer}</p>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="Enter marks"
                    className="w-32"
                    onChange={(e) => setMarks(prev => ({ ...prev, [response.id]: Number(e.target.value) }))}
                  />
                  <Button onClick={() => handleGrade(response.id)}>Save Grade</Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
