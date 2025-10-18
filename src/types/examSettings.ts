export interface GradeCriterion {
  id: string;
  name: string;
  minScore: number;
  maxScore: number;
  remark: string;
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
    enablePsychomotor: boolean;
}
