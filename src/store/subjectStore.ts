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
  fetchSubjects: async (schoolId: string, sectionId?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await subjectService.getSubjects({
        schoolId,
        ...(sectionId && { sectionId }),
        isActive: "true",
        limit: 10,
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
