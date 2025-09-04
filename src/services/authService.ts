import { apiClient } from '../utils/api';

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
  role: 'teacher' | 'accountant' | 'librarian';
  designation: string;
  dob: string;
  salary: number;
  joining_date: string;
  gender: 'male' | 'female';
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
  gender: 'male' | 'female';
  dob: string;
  phone: string;
  address: string;
  admission_date: string;
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
  guardian_password?: string;
}

// Updated to match backend expectations
interface OnboardingData {
  adminName: string;          // Maps to superAdminUsername in backend
  adminEmail: string;         // Maps to superAdminEmail in backend  
  adminUsername: string;      // Maps to superAdminUsername in backend
  adminPassword: string;      // Maps to superAdminPassword in backend
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite?: string;     // Optional field
  appName?: string;           // Optional field
  allowRegistration?: boolean;
  sessionTimeout?: number;
  maxFileSize?: number;
  enableEmailNotifications?: boolean;
}

interface School {
  id: string;
  name: string;
  email: string;
  address: string;
}

interface Class {
  id: string;
  name: string;
  schoolId: string;
}

interface Section {
  id: string;
  name: string;
  classId: string;
}

export const authService = {
  // Check if system is onboarded
  checkOnboardingStatus: () => apiClient.get('/system/onboarding/check'),
  
  // Initialize system (onboarding) - transform data to match backend
  initializeSystem: (data: OnboardingData) => {
    const backendData = {
      superAdminUsername: data.adminUsername,
      superAdminEmail: data.adminEmail,
      superAdminPassword: data.adminPassword,
      schoolName: data.schoolName,
      schoolEmail: data.schoolEmail,
      schoolAddress: data.schoolAddress,
      schoolPhone: data.schoolPhone,
    };
    return apiClient.post('/auth/initialize', backendData);
  },
  
  // Login
  login: (credentials: LoginCredentials) => apiClient.post('/auth/login', credentials),
  
  // Staff signup
  staffSignup: (data: StaffSignupData) => apiClient.post('/auth/staff-signup', data),
  
  // Student signup
  studentSignup: (data: StudentSignupData) => apiClient.post('/auth/student-signup', data),
  
  // Get schools (for dropdowns)
  getSchools: () => apiClient.get('/school/all'),
  
  // Get classes by school, which includes sections
  getClasses: (schoolId: string) => apiClient.get(`/class?schoolId=${schoolId}`),

  // Email verification
  verifyEmail: (userId: string, otp: string) => apiClient.post('/auth/verify-email-otp', { userId, otp }),
  
  // Resend OTP
  resendOTP: (identifier: { userId?: string; email?: string }) => {
    const payload = identifier.userId
      ? { id: identifier.userId, type: 'email_verification' }
      : { email: identifier.email, type: 'email_verification' };
    return apiClient.post('/auth/resend-otp', payload);
  },
};

export type { OnboardingData, StaffSignupData, StudentSignupData, School, Class, Section };