import { SubjectResult } from '@/types/examination';

interface AcademicPerformanceTableProps {
  results: SubjectResult[];
}

const AcademicPerformanceTable = ({ results }: AcademicPerformanceTableProps) => {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">Academic Performance</h3>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Subject</th>
            <th className="border p-2">Score</th>
            <th className="border p-2">Grade</th>
            <th className="border p-2 text-left">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td className="border p-2">{r.subject}</td>
              <td className="border p-2 text-center">{r.score}</td>
              <td className="border p-2 text-center">{r.grade}</td>
              <td className="border p-2">{r.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AcademicPerformanceTable;
