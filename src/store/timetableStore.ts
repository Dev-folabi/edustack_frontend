import { create } from "zustand";
import {
  timetableService,
  type Timetable,
  type Entry,
  type CreateTimetableData,
  type CreateEntryData,
  type UpdateEntryData,
} from "@/services/timetableService";

const showErrorToast = (message: string) => {
  const event = new CustomEvent("showToast", {
    detail: {
      type: "error",
      title: "Error",
      message: message,
    },
  });
  window.dispatchEvent(event);
};

const showSuccessToast = (message: string) => {
  const event = new CustomEvent("showToast", {
    detail: {
      type: "success",
      title: "Success",
      message: message,
    },
  });
  window.dispatchEvent(event);
};

interface TimetableState {
  timetables: Timetable[];
  selectedTimetable: Timetable | null;
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  editingEntry: Entry | null;

  // Actions
  fetchSchoolTimetables: (schoolId: string) => Promise<void>;
  fetchClassTimetable: (sectionId: string) => Promise<void>;
  createTimetable: (data: CreateTimetableData) => Promise<Timetable | undefined>;
  deleteTimetable: (timetableId: string) => Promise<void>;
  createEntry: (data: CreateEntryData) => Promise<void>;
  updateEntry: (entryId: string, data: UpdateEntryData) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  selectTimetable: (timetable: Timetable | null) => void;
  openModal: (entry?: Entry) => void;
  closeModal: () => void;
}

export const useTimetableStore = create<TimetableState>((set, get) => ({
  timetables: [],
  selectedTimetable: null,
  isLoading: false,
  error: null,
  isModalOpen: false,
  editingEntry: null,

  fetchSchoolTimetables: async (schoolId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.getSchoolTimetables(schoolId);
      if (response.success && response.data) {
        set({ timetables: response.data.data, isLoading: false });
      } else {
        throw new Error(response.message || "Failed to fetch timetables.");
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      showErrorToast(error.message);
    }
  },

  fetchClassTimetable: async (sectionId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.getClassTimetable(sectionId);
      if (response.success && response.data) {
        set({ selectedTimetable: response.data.data, isLoading: false });
      } else {
        set({ selectedTimetable: null, isLoading: false });
        if (response.message) {
          showErrorToast(response.message);
        }
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      showErrorToast(error.message);
    }
  },

  createTimetable: async (data: CreateTimetableData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.createTimetable(data);
      if (response.success && response.data) {
        set({ isLoading: false });
        showSuccessToast("Timetable created successfully!");
        // Refetch timetables for the school
        get().fetchSchoolTimetables(data.schoolId);
        return response.data.data;
      } else {
        throw new Error(response.message || "Failed to create timetable.");
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      showErrorToast(error.message);
      return undefined;
    }
  },

  deleteTimetable: async (timetableId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.deleteTimetable(timetableId);
      if (response.success) {
        set({ isLoading: false });
        set((state) => ({
          timetables: state.timetables.filter((t) => t.id !== timetableId),
          selectedTimetable: state.selectedTimetable?.id === timetableId ? null : state.selectedTimetable,
        }));
        showSuccessToast("Timetable deleted successfully!");
      } else {
        throw new Error(response.message || "Failed to delete timetable.");
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      showErrorToast(error.message);
    }
  },

  createEntry: async (data: CreateEntryData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.createEntry(data);
      if (response.success && response.data) {
        set({ isLoading: false });
        set((state) => {
          if (state.selectedTimetable) {
            const updatedTimetable = {
              ...state.selectedTimetable,
              entries: [...state.selectedTimetable.entries, response.data.data],
            };
            return { selectedTimetable: updatedTimetable };
          }
          return {};
        });
        showSuccessToast("Entry created successfully!");
        get().closeModal();
      } else {
        throw new Error(response.message || "Failed to create entry.");
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      showErrorToast(error.message);
    }
  },

  updateEntry: async (entryId: string, data: UpdateEntryData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.updateEntry(entryId, data);
      if (response.success && response.data) {
        set({ isLoading: false });
        set((state) => {
          if (state.selectedTimetable) {
            const updatedEntries = state.selectedTimetable.entries.map((e) =>
              e.id === entryId ? response.data.data : e
            );
            const updatedTimetable = {
              ...state.selectedTimetable,
              entries: updatedEntries,
            };
            return { selectedTimetable: updatedTimetable };
          }
          return {};
        });
        showSuccessToast("Entry updated successfully!");
        get().closeModal();
      } else {
        throw new Error(response.message || "Failed to update entry.");
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      showErrorToast(error.message);
    }
  },

  deleteEntry: async (entryId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.deleteEntry(entryId);
      if (response.success) {
        set({ isLoading: false });
        set((state) => {
          if (state.selectedTimetable) {
            const updatedEntries = state.selectedTimetable.entries.filter(
              (e) => e.id !== entryId
            );
            const updatedTimetable = {
              ...state.selectedTimetable,
              entries: updatedEntries,
            };
            return { selectedTimetable: updatedTimetable };
          }
          return {};
        });
        showSuccessToast("Entry deleted successfully!");
      } else {
        throw new Error(response.message || "Failed to delete entry.");
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      showErrorToast(error.message);
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
