import { create } from 'zustand';
import { authService, type OnboardingData, type School, type Class, type Section } from '@/services/authService';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isSuperAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isOnboarded: boolean;
  schools: School[];
  classes: Class[];
  sections: Section[];
  
  // Actions
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => void;
  checkOnboardingStatus: () => Promise<{ isOnboarded: boolean; currentStep?: number; onboardingProgress?: number }>;
  initializeSystem: (data: OnboardingData) => Promise<void>;
  loadSchools: () => Promise<void>;
  loadClasses: (schoolId: string) => Promise<void>;
  loadSections: (classId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isOnboarded: false,
  schools: [],
  classes: [],
  sections: [],

  login: async (emailOrUsername: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await authService.login({ emailOrUsername, password });
      
      if (response.success && response.data) {
        const { userData, token } = response.data;
        set({ 
          user: userData, 
          token,
          isLoading: false 
        });
        
        // Store token in localStorage
        localStorage.setItem('token', token);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
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
          onboardingProgress: response.data.onboardingProgress
        };
      }
      return { isOnboarded: false };
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return { isOnboarded: false };
    }
  },

  initializeSystem: async (data: OnboardingData) => {
    try {
      set({ isLoading: true });
      const response = await authService.initializeSystem(data);
      if (response.success) {
        set({ isOnboarded: true, isLoading: false });
      } else {
        throw new Error(response.message || 'System initialization failed');
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadSchools: async () => {
    try {
      const response = await authService.getSchools();
      if (response.success && response.data) {
        set({ schools: response.data });
      }
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  },

  loadClasses: async (schoolId: string) => {
    try {
      const response = await authService.getClasses(schoolId);
      if (response.success && response.data) {
        set({ classes: response.data, sections: [] });
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  },

  loadSections: async (classId: string) => {
    try {
      const response = await authService.getSections(classId);
      if (response.success && response.data) {
        set({ sections: response.data });
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));