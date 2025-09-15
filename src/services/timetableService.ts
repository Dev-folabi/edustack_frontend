import { apiClient, ApiResponse } from "@/utils/api";
import { ITimetable } from "@/types/timetable";

export const getSchoolTimetables = async (schoolId: string): Promise<ApiResponse<ITimetable[]>> => {
  return apiClient.get<ITimetable[]>(`/timetables/school/${schoolId}`);
};

export const getSectionTimetable = async (sectionId: string): Promise<ApiResponse<ITimetable>> => {
  return apiClient.get<ITimetable>(`/timetables/class/${sectionId}`);
};

export const deleteTimetable = async (timetableId: string): Promise<ApiResponse> => {
  return apiClient.delete(`/timetables/${timetableId}`);
};

export const deleteTimetableEntry = async (entryId: string): Promise<ApiResponse> => {
  return apiClient.delete(`/timetables/entries/${entryId}`);
};

export const updateTimetable = async (timetableId: string, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/timetables/${timetableId}`, data);
};

export const updateTimetableEntry = async (entryId: string, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/timetables/entries/${entryId}`, data);
};
