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
      const response = await schoolService.getStaffBySchool(schoolId) as StaffApiResponse;
      if (response.success && response.data && response.data.data) {
        // Filter only staff with 'teacher' role and map to the expected Staff interface
        const teachers = response.data.data
          .filter((staffMember: StaffMember) => staffMember.role === 'teacher')
          .map((staffMember: StaffMember) => ({
            id: staffMember.user.staff.id,
            name: staffMember.user.staff.name,
            email: staffMember.user.staff.email,
            user: {
              id: staffMember.user.staff.id, // Using staff id as user id for consistency
              username: staffMember.user.username,
            }
          }));
        set({ teachers });
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
        await get().fetchClasses(selectedSchool.schoolId);
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
        await get().fetchClasses(selectedSchool.schoolId);
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
        await get().fetchClasses(selectedSchool.schoolId);
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
        await get().fetchClasses(selectedSchool.schoolId);
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

// Interface for a single staff member from API
interface StaffMember {
  role: string;
  user: {
    username: string;
    email: string;
    staff: {
      id: string;
      name: string;
      phone: string[];
      email: string;
      address: string;
      designation: string;
      dob: string;
      salary: number;
      joining_date: string;
      gender: string;
      photo_url: string | null;
      qualification: string;
      notes: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// Interface for the API response for a list of staff
interface StaffApiResponse {
  success: boolean;
  message: string;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    prevPage: number | null;
    nextPage: number | null;
    itemPerPage: number;
    data: StaffMember[];
  };
}
