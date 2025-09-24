import { create } from "zustand";
import { subjectService } from "@/services/subjectService";
import { Subject } from "@/types/subject";

interface SubjectState {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  fetchSubjects: (schoolId: string) => Promise<void>;
}

export const useSubjectStore = create<SubjectState>((set) => ({
  subjects: [],
  loading: false,
  error: null,
  fetchSubjects: async (schoolId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await subjectService.getSubjects({
        schoolId,
        isActive: "true",
        limit: 1000,
      });

      if (response.success) {
        set({
          subjects: response.data.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: "Failed to fetch subjects" });
    }
  },
}));
