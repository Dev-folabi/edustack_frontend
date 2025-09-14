import { apiClient, ApiResponse } from '@/utils/api';
import { Staff } from '@/types/staff';

export interface PaginatedStaff {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  prevPage: number | null;
  nextPage: number | null;
  itemPerPage: number;
  data: Staff[];
}

export const staffService = {
  getStaffBySchool: (
    schoolId: string,
    filters: { role?: string; isActive?: boolean } = {}
  ): Promise<ApiResponse<PaginatedStaff>> => {
    const params = new URLSearchParams(filters as Record<string, string>);
    return apiClient.get(`/staff/school/${schoolId}?${params.toString()}`);
  },
};
