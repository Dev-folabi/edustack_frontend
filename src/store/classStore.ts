import { create } from "zustand";
import {
  classService,
  Class,
  CreateClassData,
  UpdateClassData,
  UpdateSectionData,
} from "@/services/classService";
import { schoolService, Staff } from "@/services/schoolService";
import { useAuthStore } from "./authStore";

interface ClassState {
  classes: Class[];
  teachers: Staff[];
  isLoading: boolean;
  error: string | null;
  fetchClasses: (schoolId: string, search?: string) => Promise<void>;
  fetchTeachers: (schoolId: string) => Promise<void>;
  createClass: (data: CreateClassData) => Promise<void>;
  updateClass: (classId: string, data: UpdateClassData) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
  updateSection: (
    sectionId: string,
    data: UpdateSectionData
  ) => Promise<void>;
}

export const useClassStore = create<ClassState>((set, get) => ({
  classes: [],
  teachers: [],
  isLoading: false,
  error: null,

  fetchClasses: async (schoolId: string, search?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await classService.getClasses(schoolId, search);
      if (response.success) {
        set({ classes: response.data.data, isLoading: false });
      } else {
        throw new Error(response.message || "Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      if (error instanceof Error) {
        set({ isLoading: false, error: error.message });
      }
    }
  },

  fetchTeachers: async (schoolId: string) => {
    try {
      // This might be refactored to a more generic staff store in the future
      const response = await schoolService.getStaffBySchool(schoolId);
      if (response.success && response.data && response.data.data) {
        // Assuming the API returns a list of staff with a 'teacher' role
        // For now, we'll take all staff returned by this endpoint
        set({ teachers: response.data.data });
      } else {
        throw new Error(response.message || "Failed to fetch teachers");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      if (error instanceof Error) {
        set({ error: error.message });
      }
    }
  },

  createClass: async (data: CreateClassData): Promise<void> => {
    try {
      set({ isLoading: true });
      await classService.createClass(data);
      const selectedSchool = useAuthStore.getState().selectedSchool;
      if (selectedSchool) {
        await get().fetchClasses(selectedSchool.id);
      }
    } catch (error) {
      console.error("Error creating class:", error);
      if (error instanceof Error) {
        set({ error: error.message });
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateClass: async (classId: string, data: UpdateClassData): Promise<void> => {
    try {
      set({ isLoading: true });
      await classService.updateClass(classId, data);
      const selectedSchool = useAuthStore.getState().selectedSchool;
      if (selectedSchool) {
        await get().fetchClasses(selectedSchool.id);
      }
    } catch (error) {
      console.error("Error updating class:", error);
      if (error instanceof Error) {
        set({ error: error.message });
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteClass: async (classId: string): Promise<void> => {
    try {
      set({ isLoading: true });
      await classService.deleteClass(classId);
      const selectedSchool = useAuthStore.getState().selectedSchool;
      if (selectedSchool) {
        await get().fetchClasses(selectedSchool.id);
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      if (error instanceof Error) {
        set({ error: error.message });
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateSection: async (
    sectionId: string,
    data: UpdateSectionData
  ): Promise<void> => {
    try {
      set({ isLoading: true });
      await classService.updateSection(sectionId, data);
      const selectedSchool = useAuthStore.getState().selectedSchool;
      if (selectedSchool) {
        await get().fetchClasses(selectedSchool.id);
      }
    } catch (error) {
      console.error("Error updating section:", error);
      if (error instanceof Error) {
        set({ error: error.message });
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
