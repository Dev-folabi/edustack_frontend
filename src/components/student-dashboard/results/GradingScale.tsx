"use client";

import { useEffect, useState } from 'react';
import { examinationService } from '@/services/examinationService';

interface Grade {
    id: string;
    grade: string;
    minScore: number;
    maxScore: number;
    description: string;
}

const GradingScale = () => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await examinationService.getGradingScale();
                if (response.success) {
                    setGrades(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch grading scale", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGrades();
    }, []);

    if (isLoading) {
        return <div>Loading grading scale...</div>;
    }

    if (grades.length === 0) {
        return null;
    }

    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Grading Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm p-4 border rounded-md">
          {grades.map(g => (
            <div key={g.id}><strong>{g.grade}:</strong> {g.minScore}-{g.maxScore} ({g.description})</div>
          ))}
        </div>
      </div>
    );
  };

  export default GradingScale;
