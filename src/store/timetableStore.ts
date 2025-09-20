import { create } from "zustand";
import {
  timetableService,
  type Timetable,
  type Entry,
  type CreateTimetableData,
  type UpdateTimetableData,
  type CreateEntryData,
  type UpdateEntryData,
  TimetableResponse,
  TimetablesResponse,
  EntryResponse,
} from "@/services/timetableService";
import { ApiResponse } from "@/utils/api";

interface TimetableState {
  timetables: Timetable[];
  schoolTimetables: Timetable[];
  selectedTimetable: Timetable | null;
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  editingEntry: Entry | null;

  // Actions
  fetchSchoolTimetables: (
    schoolId: string
  ) => Promise<ApiResponse<TimetablesResponse>>;
  fetchClassTimetable: (
    sectionId: string
  ) => Promise<ApiResponse<TimetableResponse>>;
  createTimetable: (
    data: CreateTimetableData
  ) => Promise<ApiResponse<TimetableResponse>>;
  updateTimetable: (
    timetableId: string,
    data: UpdateTimetableData
  ) => Promise<ApiResponse<TimetableResponse>>;
  deleteTimetable: (timetableId: string) => Promise<ApiResponse<void>>;
  createEntry: (data: CreateEntryData) => Promise<ApiResponse<EntryResponse>>;
  updateEntry: (
    entryId: string,
    data: UpdateEntryData
  ) => Promise<ApiResponse<EntryResponse>>;
  deleteEntry: (entryId: string) => Promise<ApiResponse<void>>;
  selectTimetable: (timetable: Timetable | null) => void;
  openModal: (entry?: Entry) => void;
  closeModal: () => void;
}

export const useTimetableStore = create<TimetableState>((set, get) => ({
  timetables: [],
  schoolTimetables: [],
  selectedTimetable: null,
  isLoading: false,
  error: null,
  isModalOpen: false,
  editingEntry: null,

  fetchSchoolTimetables: async (schoolId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await timetableService.getSchoolTimetables(schoolId);
      if (response.success && response.data) {
        set({
          timetables: response.data.data,
          schoolTimetables: response.data.data,
          isLoading: false,
        });
      } else {
        set({ error: response.message, isLoading: false });
      }
      return response;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message, data: null };
    }
  },

  fetchClassTimetable: async (sectionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await timetableService.getClassTimetable(sectionId);
      if (response.success && response.data) {
        // Fix: The class timetable endpoint returns { data: Timetable }, so access response.data.data
        set({ selectedTimetable: response.data, isLoading: false });
      } else {
        set({ selectedTimetable: null, isLoading: false, error: response.message });
      }
      return response;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message, data: null };
    }
  },

  createTimetable: async (data: CreateTimetableData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await timetableService.createTimetable(data);
      set({ isLoading: false });
      if (response.success) {
        await get().fetchSchoolTimetables(data.schoolId);
      }
      return response;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message, data: null };
    }
  },

  updateTimetable: async (timetableId: string, data: UpdateTimetableData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await timetableService.updateTimetable(timetableId, data);
       set({ isLoading: false });
      if (response.success && data.schoolId) {
        await get().fetchSchoolTimetables(data.schoolId);
        // Also refresh the selected timetable if it matches
        const currentSelected = get().selectedTimetable;
        if (currentSelected?.id === timetableId) {
          await get().fetchClassTimetable(currentSelected.sectionId);
        }
      }
      return response;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message, data: null };
    }
  },

  deleteTimetable: async (timetableId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await timetableService.deleteTimetable(timetableId);
       set({ isLoading: false });
      if (response.success) {
        set((state) => ({
          timetables: state.timetables.filter((t) => t.id !== timetableId),
           schoolTimetables: state.schoolTimetables.filter((t) => t.id !== timetableId),
          selectedTimetable:
            state.selectedTimetable?.id === timetableId
              ? null
              : state.selectedTimetable,
        }));
      }
      return response;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message, data: null };
    }
  },

  createEntry: async (data: CreateEntryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await timetableService.createEntry(data);
      set({ isLoading: false });
      // Refresh the selected timetable after creating entry
      const currentSelected = get().selectedTimetable;
      if (response.success && currentSelected?.sectionId) {
        await get().fetchClassTimetable(currentSelected.sectionId);
      }
      return response;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message, data: null };
    }
  },

  updateEntry: async (entryId: string, data: UpdateEntryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await timetableService.updateEntry(entryId, data);
      set({ isLoading: false });
      // Refresh the selected timetable after updating entry
      const currentSelected = get().selectedTimetable;
      if (response.success && currentSelected?.sectionId) {
        await get().fetchClassTimetable(currentSelected.sectionId);
      }
      return response;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message, data: null };
    }
  },

  deleteEntry: async (entryId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await timetableService.deleteEntry(entryId);
      set({ isLoading: false });
      // Refresh the selected timetable after deleting entry
      const currentSelected = get().selectedTimetable;
      if (response.success && currentSelected?.sectionId) {
        await get().fetchClassTimetable(currentSelected.sectionId);
      }
      return response;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message, data: null };
    }
  },

  selectTimetable: (timetable: Timetable | null) => {
    set({ selectedTimetable: timetable });
  },

  openModal: (entry?: Entry) => {
    set({ isModalOpen: true, editingEntry: entry || null });
  },

  closeModal: () => {
    set({ isModalOpen: false, editingEntry: null });
  },
}));