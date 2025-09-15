import { apiClient, ApiResponse } from "../utils/api";
import { School } from "./authService";

// Enums from the backend schema
export enum WeekDay {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum PeriodType {
  REGULAR = "REGULAR",
  BREAK = "BREAK",
  LUNCH = "LUNCH",
  ASSEMBLY = "ASSEMBLY",
  SPORTS = "SPORTS",
  LIBRARY = "LIBRARY",
  FREE_PERIOD = "FREE_PERIOD",
}

export enum TimetableStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

// Interface for a single timetable entry
export interface Entry {
  id: string;
  timetableId: string;
  day: WeekDay[];
  startTime: string; // Assuming ISO string format
  endTime: string; // Assuming ISO string format
  subjectId?: string;
  teacherId?: string;
  type: PeriodType;
  subject?: { id: string; name: string };
  teacher?: { id: string; name: string };
}

// Interface for a timetable
export interface Timetable {
  id: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  sessionId: string;
  termId?: string;
  name: string;
  status: TimetableStatus;
  entries: Entry[];
  school: School;
  section: { id: string; name: string; class?: { id: string; name: string } };
  session: { id: string; name: string };
  term?: { id: string; name: string };
}

// Data for creating a new timetable
export interface CreateTimetableData {
  schoolId: string;
  classId: string;
  sectionId: string;
  sessionId: string;
  termId?: string;
  status?: TimetableStatus;
  entries: Omit<Entry, "id" | "timetableId" | "subject" | "teacher">[];
}

// Data for creating a new timetable entry
export interface CreateEntryData {
  timetableId: string;
  day: WeekDay[];
  startTime: string;
  endTime: string;
  subjectId?: string;
  teacherId?: string;
  type?: PeriodType;
}

// Data for updating a timetable entry
export type UpdateEntryData = Partial<CreateEntryData>;

export type UpdateTimetableData = Partial<CreateTimetableData>;

// API response for a list of timetables
interface TimetablesResponse {
  data: Timetable[];
}

// API response for a single timetable
interface TimetableResponse {
  data: Timetable;
}

// API response for a single entry
interface EntryResponse {
  data: Entry;
}

export const timetableService = {
  // Get all timetables for a school
  getSchoolTimetables: (
    schoolId: string
  ): Promise<ApiResponse<TimetablesResponse>> => {
    return apiClient.get(`/timetables/school/${schoolId}`);
  },

  // Get timetable for a specific class section
  getClassTimetable: (
    sectionId: string
  ): Promise<ApiResponse<TimetableResponse>> => {
    return apiClient.get(`/timetables/class/${sectionId}`);
  },

  // Create a new timetable
  createTimetable: (
    data: CreateTimetableData
  ): Promise<ApiResponse<TimetableResponse>> => {
    return apiClient.post("/timetables", data);
  },

  // Delete a timetable by its ID
  deleteTimetable: (timetableId: string): Promise<ApiResponse<any>> => {
    return apiClient.delete(`/timetables/${timetableId}`);
  },

  // Update a timetable by its ID
  updateTimetable: (
    timetableId: string,
    data: UpdateTimetableData
  ): Promise<ApiResponse<TimetableResponse>> => {
    return apiClient.put(`/timetables/${timetableId}`, data);
  },

  // Create a new timetable entry
  createEntry: (data: CreateEntryData): Promise<ApiResponse<EntryResponse>> => {
    return apiClient.post("/timetables/entries", data);
  },

  // Update a timetable entry by its ID
  updateEntry: (
    entryId: string,
    data: UpdateEntryData
  ): Promise<ApiResponse<EntryResponse>> => {
    return apiClient.put(`/timetables/entries/${entryId}`, data);
  },

  // Delete a timetable entry by its ID
  deleteEntry: (entryId: string): Promise<ApiResponse<any>> => {
    return apiClient.delete(`/timetables/entries/${entryId}`);
  },
};
