import { create } from 'zustand';
import { getGradeCriteria, getPsychomotorSkills, getGeneralSettings } from '@/services/examSettingsService';
import { GradeCriterion, PsychomotorSkill, GeneralSettings } from '@/types/examSettings';

interface ExamSettingsState {
  gradeCriteria: GradeCriterion[];
  psychomotorSkills: PsychomotorSkill[];
  generalSettings: GeneralSettings | null;
  loading: boolean;
  error: string | null;
  fetchGradeCriteria: () => Promise<void>;
  fetchPsychomotorSkills: () => Promise<void>;
  fetchGeneralSettings: () => Promise<void>;
}

export const useExamSettingsStore = create<ExamSettingsState>((set) => ({
  gradeCriteria: [],
  psychomotorSkills: [],
  generalSettings: null,
  loading: false,
  error: null,
  fetchGradeCriteria: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getGradeCriteria();
      if (response.success) {
        set({
          gradeCriteria: response.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch grade criteria' });
    }
  },
  fetchPsychomotorSkills: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getPsychomotorSkills();
      if (response.success) {
        set({
          psychomotorSkills: response.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch psychomotor skills' });
    }
  },
  fetchGeneralSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getGeneralSettings();
      if (response.success) {
        set({
          generalSettings: response.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch general settings' });
    }
  },
}));
