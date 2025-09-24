import { PsychomotorSkill } from '@/types/examination';

interface PsychomotorSkillsProps {
  skills: PsychomotorSkill[];
}

const PsychomotorSkills = ({ skills }: PsychomotorSkillsProps) => {
  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">Psychomotor Skills</h3>
      <table className="w-1/2 border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Skill</th>
            <th className="border p-2">Rating (1-5)</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((s, i) => (
            <tr key={i}>
              <td className="border p-2">{s.skill}</td>
              <td className="border p-2 text-center">{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PsychomotorSkills;
