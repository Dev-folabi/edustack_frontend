import { apiClient, ApiResponse } from '@/utils/api';
import { Staff, StaffRegistrationPayload } from '@/types/staff';

export interface PaginatedStaff {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  prevPage: number | null;
  nextPage: number | null;
  itemPerPage: number;
  data: Staff[];
}

export interface StaffFilters {
  role?: string;
  name?: string;
  email?: string;
  page?: number;
  limit?: number;
}

export const staffService = {
  createStaff: (
    schoolId: string,
    data: StaffRegistrationPayload
  ): Promise<ApiResponse<any>> => {
    return apiClient.post(`/staff?schoolId=${schoolId}`, data);
  },

  getStaffBySchool: (
    schoolId: string,
    filters: StaffFilters = {}
  ): Promise<ApiResponse<PaginatedStaff>> => {
    const params = new URLSearchParams(filters as unknown as Record<string, string>);
    return apiClient.get(`/staff/school/${schoolId}?${params.toString()}`);
  },

  getStaffById: (schoolId: string, staffId: string): Promise<ApiResponse<{ staff: Staff }>> => {
    return apiClient.get(`/staff/${schoolId}/${staffId}`);
  },

  updateStaff: (
    staffId: string,
    data: Partial<StaffRegistrationPayload>
  ): Promise<ApiResponse<Staff>> => {
    return apiClient.put(`/staff/${staffId}`, data);
  },

  deleteStaff: (schoolId: string, staffId: string): Promise<ApiResponse<any>> => {
    return apiClient.delete(`/staff/${schoolId}/${staffId}`);
  },

  bulkRegisterStaff: (schoolId: string, file: File): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/staff/bulk-register?schoolId=${schoolId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};
