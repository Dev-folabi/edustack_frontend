import { create } from "zustand";
import { schoolService } from "@/services/schoolService";
import type { School } from "@/services/authService";
import { CreateSchoolData, UpdateSchoolData } from "@/services/schoolService";

export type { School };

interface SchoolState {
  schools: School[];
  isLoading: boolean;
  fetchSchools: () => Promise<void>;
  createSchool: (schoolData: CreateSchoolData) => Promise<any>;
  updateSchool: (
    schoolId: string,
    schoolData: UpdateSchoolData
  ) => Promise<any>;
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
      if (
        typeof response === "object" &&
        response !== null &&
        "success" in response &&
        response.success === true &&
        "data" in response &&
        response.data &&
        typeof response.data === "object" &&
        response.data !== null &&
        "data" in response.data &&
        Array.isArray(response.data.data)
      ) {
        const schools = response.data.data;
        set({
          schools,
          isLoading: false,
        });
      } else {
        let message = "Failed to fetch schools";
        if (
          typeof response === "object" &&
          response !== null &&
          "message" in response &&
          typeof (response as any).message === "string"
        ) {
          message = (response as any).message;
        }
        throw new Error(message);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      set({ isLoading: false });
    }
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
