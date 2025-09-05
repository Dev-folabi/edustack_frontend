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

// Interface for updating a school, all fields are optional
export type UpdateSchoolData = Partial<CreateSchoolData>;

// The API response for a single school might be wrapped in a data object
interface SchoolResponse {
  data: School;
}

export const schoolService = {
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
};
