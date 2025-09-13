import { UserRole } from '@/constants/roles';
import { apiClient, ApiResponse } from '@/utils/api';

export interface Subject {
  id: string;
  name: string;
  code: string;
  className: string;
  teacher: string;
  isActive: boolean;
  schoolIds: string[];
  sectionIds: string[];
}

export interface Teacher {
  id: string;
  name: string;
}


const BASE_URL = '/subjects';

export const subjectService = {
  getSubjects: async (filters: { [key: string]: string | number } = {}): Promise<ApiResponse<any>> => {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    return apiClient.get(`${BASE_URL}?${query}`);
  },

  getSubject: async (id: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`${BASE_URL}/${id}`);
  },

  createSubject: async (data: Partial<Subject>): Promise<ApiResponse<any>> => {
    return apiClient.post(BASE_URL, data);
  },

  updateSubject: async (id: string, data: Partial<Subject>): Promise<ApiResponse<any>> => {
    return apiClient.put(`${BASE_URL}/${id}`, data);
  },

  deleteSubject: async (id: string): Promise<ApiResponse<any>> => {
    return apiClient.delete(`${BASE_URL}/${id}`);
  },

  assignTeacher: async (subjectId: string, teacherId: string): Promise<ApiResponse<any>> => {
    return apiClient.put(`${BASE_URL}/${subjectId}/teacher`, { teacherId });
  },
};

export const staffService = {
    getAllStaff: async (schoolId: string): Promise<ApiResponse<any>> => {
        return apiClient.get(`/staff/school/${schoolId}`);
    }
}
