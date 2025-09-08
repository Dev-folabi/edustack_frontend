import { apiClient } from "../utils/api";

export interface ClassSection {
  id: string;
  name: string;
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

export type UpdateClassData = Partial<CreateClassData>;

interface ClassesResponse {
  data: Class[];
}

interface ClassResponse {
  data: Class;
}

export const classService = {
  getClasses: (schoolId: string): Promise<any> => {
    return apiClient.get<ClassesResponse>(`/class?schoolId=${schoolId}`);
  },

  createClass: (data: CreateClassData): Promise<any> => {
    return apiClient.post<ClassResponse>("/class", data);
  },

  updateClass: (classId: string, data: UpdateClassData): Promise<any> => {
    return apiClient.put<ClassResponse>(`/class/${classId}`, data);
  },

  deleteClass: (classId: string): Promise<any> => {
    return apiClient.delete(`/class/${classId}`);
  },
};
