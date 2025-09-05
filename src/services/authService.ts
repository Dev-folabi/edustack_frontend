import { apiClient } from "../utils/api";

interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

interface StaffSignupData {
  email: string;
  password: string;
  username: string;
  name: string;
  phone: string[];
  address: string;
  schoolId: string;
  role: "teacher" | "accountant" | "librarian";
  designation: string;
  dob: string;
  salary: number;
  joining_date: string;
  gender: "male" | "female";
  photo_url?: string;
  isActive: boolean;
  qualification: string;
  notes?: string;
  classSectionId?: string;
}

interface StudentSignupData {
  email: string;
  password: string;
  username: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  name: string;
  gender: "male" | "female";
  dob: string;
  phone: string;
  address: string;
  admission_date?: string;
  religion?: string;
  blood_group?: string;
  father_name?: string;
  mother_name?: string;
  father_occupation?: string;
  mother_occupation?: string;
  isActive: boolean;
  city?: string;
  state?: string;
  country?: string;
  route_vehicle_id?: string;
  room_id?: string;
  added_by?: string;
  photo_url?: string;
  exist_guardian: boolean;
  guardian_name?: string;
  guardian_phone?: string[];
  guardian_email?: string;
  guardian_username?: string;
  guardian_emailOrUsername?: string;
  guardian_password: string;
}

// Updated to match backend expectations
interface OnboardingData {
  adminName: string;
  adminEmail: string;
  adminUsername: string;
  adminPassword: string;
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string[];
  schoolEmail: string;
}

interface School {
  id: string;
  name: string;
  email: string;
  phone: string[];
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Class {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  schoolClasses: {
    id: string;
    classId: string;
    schoolId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  sections: Section[];
}

interface Section {
  id: string;
  name: string;
  classId: string;
  createdAt: string;
  updatedAt: string;
}

// Add these response interfaces
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface SchoolsResponse {
  data: School[];
}

interface ClassesResponse {
  data: Class[];
}

// Types for the new login response structure
interface UserSchool {
  schoolId: string;
  role: "super_admin" | "school_admin" | "teacher" | "staff";
}

interface UserData {
  id: string;
  email: string;
  username: string;
  isSuperAdmin: boolean;
  hasVerifiedEmail: boolean;
}

interface LoginResponse {
  userData: UserData;
  userSchools: UserSchool[];
  staff: any | null;
  student: any | null;
  parent: any | null;
  token: string;
}

interface OnboardingStatusResponse {
  isOnboarded: boolean;
  currentStep?: number;
  onboardingProgress?: number;
}

interface InitializationResponse {
  superAdmin: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  school: {
    id: string;
    name: string;
    email: string;
    address: string;
    phone: string[];
  };
}

export const authService = {
  // System onboarding check
  checkOnboardingStatus: (): Promise<ApiResponse<OnboardingStatusResponse>> => 
    apiClient.get("/system/onboarding/check"),

  // System initialization
  initializeSystem: (data: OnboardingData): Promise<ApiResponse<InitializationResponse>> => {
    const backendData = {
      superAdminUsername: data.adminUsername,
      superAdminEmail: data.adminEmail,
      superAdminPassword: data.adminPassword,
      schoolName: data.schoolName,
      schoolEmail: data.schoolEmail,
      schoolAddress: data.schoolAddress,
      schoolPhone: data.schoolPhone,
    };
    return apiClient.post("/auth/initialize", backendData);
  },

  // Login
  login: (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> =>
    apiClient.post("/auth/login", credentials),

  // Staff signup
  staffSignup: (data: StaffSignupData) =>
    apiClient.post("/auth/staff-signup", data),

  // Student signup
  studentSignup: (data: StudentSignupData) =>
    apiClient.post("/auth/student-signup", data),

  // Get schools (for dropdowns)
  getSchools: (): Promise<ApiResponse<SchoolsResponse>> => apiClient.get("/school/all"),

  // Get classes by school, which includes sections
  getClasses: (schoolId: string): Promise<ApiResponse<ClassesResponse>> =>
    apiClient.get(`/class?schoolId=${schoolId}`),

  // Add missing getSections method
  getSections: (classId: string): Promise<ApiResponse<Section[]>> =>
    apiClient.get(`/section?classId=${classId}`),

  // Email verification
  verifyEmail: (userId: string, otp: string) =>
    apiClient.post("/auth/verify-email-otp", { userId, otp }),

  // Resend OTP
  resendOTP: (identifier: { userId?: string; email?: string }) => {
    const payload = identifier.userId
      ? { id: identifier.userId, type: "email_verification" }
      : { email: identifier.email, type: "email_verification" };
    return apiClient.post("/auth/resend-otp", payload);
  },

};

export type {
  OnboardingData,
  StaffSignupData,
  StudentSignupData,
  School,
  Class,
  Section,
  LoginResponse,
  UserData,
  UserSchool,
  OnboardingStatusResponse,
  InitializationResponse,
};
