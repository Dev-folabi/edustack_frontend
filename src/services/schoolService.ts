import { apiClient, ApiResponse } from "../utils/api";
import { School } from "./authService"; // Re-using the School type
import { SchoolDashboardData } from "../types/dashboard";

// Interface for creating a new school
export interface CreateSchoolData {
  name: string;
  address: string;
  email: string;
  phone: string[];
  isActive?: boolean;
}

// Interface for the API response for a list of schools
interface SchoolsResponse {
  data: {
    data: School[];
  };
}

// Interface for a single staff member
export interface Staff {
  id: string;
  name: string;
  email: string;
  user: {
    id: string;
    username: string;
    staff: {
      id: string;
      name: string;
    };
  };
}

// Interface for the API response for a list of staff
interface StaffResponse {
  data: {
    filter(arg0: (staff: any) => boolean): unknown;
    data: Staff[];
  };
}

// Interface for updating a school, all fields are optional
export type UpdateSchoolData = Partial<CreateSchoolData> & { adminId?: string };

// The API response for a single school might be wrapped in a data object
interface SchoolResponse {
  data: School;
}

export const schoolService = {
  // Get all schools
  getSchools: (): Promise<unknown> => {
    return apiClient.get<SchoolsResponse>("/school/all");
  },

  // Create a new school
  createSchool: (data: CreateSchoolData): Promise<unknown> => {
    return apiClient.post<SchoolResponse>("/school", data);
  },

  // Update a school by its ID
  updateSchool: (
    schoolId: string,
    data: UpdateSchoolData
  ): Promise<unknown> => {
    return apiClient.put<SchoolResponse>(`/school/${schoolId}`, data);
  },

  // Delete a school by its ID
  deleteSchool: (schoolId: string): Promise<unknown> => {
    return apiClient.delete(`/school/${schoolId}`);
  },

  // Get staff by school ID
  getStaffBySchool: (
    schoolId: string,
    role?: string,
    isActive?: boolean
  ): Promise<ApiResponse<StaffResponse>> => {
    return apiClient.get<StaffResponse>(
      `/staff/school/${schoolId}${role ? `?role=${role}` : ""}${
        isActive !== undefined ? `${role ? "&" : "?"}isActive=${isActive}` : ""
      }`
    );
  },

  // Get school dashboard data
  getDashboardData: (
    schoolId: string,
    dateRange?: { from: string; to: string }
  ): Promise<ApiResponse<SchoolDashboardData>> => {
    const params = new URLSearchParams();
    if (dateRange?.from) params.append("startDate", dateRange.from);
    if (dateRange?.to) params.append("endDate", dateRange.to);

    return apiClient.get<SchoolDashboardData>(
      `/school/dashboard/${schoolId}?${params.toString()}`
    );
  },
};
