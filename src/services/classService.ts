import { apiClient, ApiResponse } from "../utils/api";
import { Staff } from "./schoolService";

export interface ClassSection {
  id: string;
  name: string;
  classId: string;
  teacherId?: string | null;
  class_teacher?: Staff | null;
}

export interface Class {
  id: string;
  name: string;
  schoolId: string;
  sections: ClassSection[];
}

export interface CreateClassData {
  name: string;
  section: string; // Comma-separated list of section names
  schoolId: string[];
}

export interface UpdateClassData {
  name?: string;
  section?: string; // Comma-separated list of section names
}

export interface UpdateSectionData {
  name?: string;
  teacherId?: string;
}

export interface PaginatedClasses {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  prevPage: number | null;
  nextPage: number | null;
  itemPerPage: number;
  data: Class[];
}

export const classService = {
  // Get all classes for a given school
  getClasses: (
    schoolId: string,
    search?: string
  ): Promise<ApiResponse<PaginatedClasses>> => {
    const params = new URLSearchParams();
    params.append("schoolId", schoolId);
    if (search) {
      params.append("search", search);
    }
    return apiClient.get(`/class?${params.toString()}`);
  },

  // Create a new class
  createClass: (data: CreateClassData): Promise<ApiResponse<Class>> => {
    return apiClient.post("/class", data);
  },

  // Update a class by its ID
  updateClass: (
    classId: string,
    data: UpdateClassData
  ): Promise<ApiResponse<Class>> => {
    return apiClient.put(`/class/${classId}`, data);
  },

  // Delete a class by its ID
  deleteClass: (classId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/class/${classId}`);
  },

  // Update a section by its ID
  updateSection: (
    sectionId: string,
    data: UpdateSectionData
  ): Promise<ApiResponse<ClassSection>> => {
    return apiClient.put(`/class/section/${sectionId}`, data);
  },

  // Delete a section by its ID
  deleteSection: (sectionId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/class/section/${sectionId}`);
  },
};
