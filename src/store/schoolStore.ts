import { create } from "zustand";
import { schoolService } from "@/services/schoolService";
import type { School } from "@/services/authService";
import { CreateSchoolData, UpdateSchoolData } from "@/services/schoolService";

export type { School };

interface SchoolState {
  schools: School[];
  selectedSchool: School | null;
  isLoading: boolean;
  fetchSchools: () => Promise<void>;
  setSelectedSchool: (school: School) => void;
  createSchool: (schoolData: CreateSchoolData) => Promise<any>;
  updateSchool: (schoolId: string, schoolData: UpdateSchoolData) => Promise<any>;
  deleteSchool: (schoolId: string) => Promise<any>;
}

export const useSchoolStore = create<SchoolState>((set, get) => ({
  schools: [],
  selectedSchool: null,
  isLoading: false,

  fetchSchools: async () => {
    try {
      set({ isLoading: true });
      const response = await schoolService.getSchools();
      if (response.success && response.data && response.data.data) {
        const schools = response.data.data;
        const activeSchool =
          schools.find((s: School) => s.isActive) || schools[0] || null;
        set({
          schools,
          selectedSchool: activeSchool,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch schools");
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      set({ isLoading: false });
    }
  },

  setSelectedSchool: (school: School) => {
    set({ selectedSchool: school });
  },

  createSchool: async (schoolData: CreateSchoolData) => {
    try {
      const response = await schoolService.createSchool(schoolData);
      // Refetch schools after creating a new one
      await get().fetchSchools();
      return response;
    } catch (error) {
      console.error("Error creating school:", error);
      throw error;
    }
  },

  updateSchool: async (schoolId: string, schoolData: UpdateSchoolData) => {
    try {
      const response = await schoolService.updateSchool(schoolId, schoolData);
      // Refetch schools after updating
      await get().fetchSchools();
      return response;
    } catch (error) {
      console.error("Error updating school:", error);
      throw error;
    }
  },

  deleteSchool: async (schoolId: string) => {
    try {
      const response = await schoolService.deleteSchool(schoolId);
      // Refetch schools after deleting
      await get().fetchSchools();
      return response;
    } catch (error) {
      console.error("Error deleting school:", error);
      throw error;
    }
  },
}));
