import { apiClient } from "../utils/api";
import { School } from "./authService"; // Re-using the School type

// Interface for creating a new school
export interface CreateSchoolData {
  name: string;
  address: string;
  email: string;
  phone: string[];
  // principal assignment might be handled separately or be a simple string
  principalName?: string;
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
    }
}

// Interface for the API response for a list of staff
interface StaffResponse {
    data: {
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
  getSchools: (): Promise<any> => {
    return apiClient.get<SchoolsResponse>("/school/all");
  },

  // Create a new school
  createSchool: (data: CreateSchoolData): Promise<any> => {
    return apiClient.post<SchoolResponse>("/school", data);
  },

  // Update a school by its ID
  updateSchool: (schoolId: string, data: UpdateSchoolData): Promise<any> => {
    return apiClient.put<SchoolResponse>(`/school/${schoolId}`, data);
  },

  // Delete a school by its ID
  deleteSchool: (schoolId: string): Promise<any> => {
    return apiClient.delete(`/school/${schoolId}`);
  },

  // Get staff by school ID
  getStaffBySchool: (schoolId: string): Promise<any> => {
    return apiClient.get<StaffResponse>(`/staff/school/${schoolId}`);
  }
};
