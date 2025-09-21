export interface GradeCriterion {
  id: string;
  grade: string;
  minScore: number;
  maxScore: number;
  description: string;
}

export interface PsychomotorSkill {
  id: string;
  name: string;
  description: string;
}

export interface GeneralSettings {
    passMark: number;
    showSchoolRemarks: boolean;
    showTeacherRemarks: boolean;
    enablePsychomotorAnalysis: boolean;
}
