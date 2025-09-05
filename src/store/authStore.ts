import { create } from "zustand";
import {
  authService,
  type OnboardingData,
  type School,
  type Class,
  type Section,
  type InitializationResponse,
  type UserData,
  type UserSchool,
} from "@/services/authService";

interface AuthState {
  user: UserData | null;
  token: string | null;
  userSchools: UserSchool[] | null;
  staff: any | null;
  student: any | null;
  parent: any | null;
  isLoading: boolean;
  isOnboarded: boolean;
  schools: School[];
  classes: Class[];
  sections: Section[];
  isLoggedIn: boolean; // Add computed property

  // Actions
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void; // Add initialization method
  checkOnboardingStatus: () => Promise<{
    isOnboarded: boolean;
    currentStep?: number;
    onboardingProgress?: number;
  }>;
  initializeSystem: (data: OnboardingData) => Promise<InitializationResponse>;
  loadSchools: () => Promise<void>;
  loadClasses: (schoolId: string) => Promise<void>;
  loadSections: (classId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  userSchools: null,
  staff: null,
  student: null,
  parent: null,
  isLoading: false,
  isOnboarded: false,
  schools: [],
  classes: [],
  sections: [],
  get isLoggedIn() {
    return !!get().user && !!get().token;
  },

  // Initialize auth state from localStorage
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      const userSchools = localStorage.getItem('userSchools');
      const staff = localStorage.getItem('staff');
      const student = localStorage.getItem('student');
      const parent = localStorage.getItem('parent');
      
      if (token && userData) {
        try {
          set({
            token,
            user: JSON.parse(userData),
            userSchools: userSchools ? JSON.parse(userSchools) : null,
            staff: staff ? JSON.parse(staff) : null,
            student: student ? JSON.parse(student) : null,
            parent: parent ? JSON.parse(parent) : null,
          });
          
          // Set cookie for middleware
          document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          // Clear corrupted data
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          localStorage.removeItem('userSchools');
          localStorage.removeItem('staff');
          localStorage.removeItem('student');
          localStorage.removeItem('parent');
        }
      }
    }
  },

  login: async (emailOrUsername: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await authService.login({ emailOrUsername, password });

      if (response.success && response.data) {
        const { userData, token, userSchools, staff, student, parent } =
          response.data;
        
        set({
          user: userData,
          token,
          userSchools,
          staff,
          student,
          parent,
          isLoading: false,
        });

        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        if (userSchools) localStorage.setItem("userSchools", JSON.stringify(userSchools));
        if (staff) localStorage.setItem("staff", JSON.stringify(staff));
        if (student) localStorage.setItem("student", JSON.stringify(student));
        if (parent) localStorage.setItem("parent", JSON.stringify(parent));
        
        // Set cookie for middleware
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: unknown) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ 
      user: null, 
      token: null, 
      userSchools: null, 
      staff: null, 
      student: null, 
      parent: null 
    });
    
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userSchools");
    localStorage.removeItem("staff");
    localStorage.removeItem("student");
    localStorage.removeItem("parent");
    
    // Clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  },

  checkOnboardingStatus: async () => {
    try {
      const response = await authService.checkOnboardingStatus();
      if (response.success && response.data) {
        const isOnboarded = response.data.isOnboarded || false;
        set({ isOnboarded });
        return {
          isOnboarded,
          currentStep: response.data.currentStep,
          onboardingProgress: response.data.onboardingProgress,
        };
      }
      return { isOnboarded: false };
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      return { isOnboarded: false };
    }
  },

  initializeSystem: async (data: OnboardingData) => {
    try {
      set({ isLoading: true });
      const response = await authService.initializeSystem(data);
      if (response.success && response.data) {
        set({ isLoading: false });
        return response.data;
      } else {
        throw new Error(response.message || "System initialization failed");
      }
    } catch (error: unknown) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadSchools: async () => {
    try {
      const response = await authService.getSchools();
      if (response.success && response.data) {
        set({ schools: response.data.data });
      }
    } catch (error: unknown) {
      console.error("Error loading schools:", error);
    }
  },

  loadClasses: async (schoolId: string) => {
    try {
      const response = await authService.getClasses(schoolId);
      if (response.success && response.data) {
        set({ classes: response.data.data, sections: [] });
      }
    } catch (error: unknown) {
      console.error("Error loading classes:", error);
    }
  },

  loadSections: async (classId: string) => {
    try {
      const response = await authService.getSections(classId);
      if (response.success && response.data) {
        set({ sections: response.data });
      }
    } catch (error: unknown) {
      console.error("Error loading sections:", error);
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
