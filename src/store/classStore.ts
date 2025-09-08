import { create } from "zustand";
import { classService, Class, CreateClassData, UpdateClassData } from "@/services/classService";

interface ClassState {
  classes: Class[];
  isLoading: boolean;
  error: string | null;
  fetchClasses: (schoolId: string) => Promise<void>;
  createClass: (classData: CreateClassData) => Promise<any>;
  updateClass: (classId: string, classData: UpdateClassData) => Promise<any>;
  deleteClass: (classId: string) => Promise<any>;
}

export const useClassStore = create<ClassState>((set, get) => ({
  classes: [],
  isLoading: false,
  error: null,

  fetchClasses: async (schoolId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await classService.getClasses(schoolId);
      if (response.success && response.data) {
        set({ classes: response.data, isLoading: false });
      } else {
        throw new Error(response.message || "Failed to fetch classes");
      }
    } catch (error: any) {
      console.error("Error fetching classes:", error);
      set({ isLoading: false, error: error.message });
    }
  },

  createClass: async (classData: CreateClassData) => {
    try {
      const response = await classService.createClass(classData);
      if (response.success && response.data) {
        // Assuming the response.data is the new class object or an array of new classes
        const newClasses = Array.isArray(response.data) ? response.data : [response.data];
        set((state) => ({
          classes: [...state.classes, ...newClasses],
        }));
      }
      return response;
    } catch (error) {
      console.error("Error creating class:", error);
      throw error;
    }
  },

  updateClass: async (classId: string, classData: UpdateClassData) => {
    try {
      const response = await classService.updateClass(classId, classData);
      if (response.success && response.data) {
        set((state) => ({
          classes: state.classes.map((c) =>
            c.id === classId ? { ...c, ...response.data } : c
          ),
        }));
      }
      return response;
    } catch (error) {
      console.error("Error updating class:", error);
      throw error;
    }
  },

  deleteClass: async (classId: string) => {
    try {
      const response = await classService.deleteClass(classId);
      if (response.success) {
        set((state) => ({
          classes: state.classes.filter((c) => c.id !== classId),
        }));
      }
      return response;
    } catch (error) {
      console.error("Error deleting class:", error);
      throw error;
    }
  },
}));
