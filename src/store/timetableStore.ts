import { create } from "zustand";
import {
  timetableService,
  type Timetable,
  type Entry,
  type CreateTimetableData,
  type UpdateTimetableData,
  type CreateEntryData,
  type UpdateEntryData,
} from "@/services/timetableService";

// Toast utilities
const showErrorToast = (message: string) => {
  const event = new CustomEvent("showToast", {
    detail: { type: "error", title: "Error", message },
  });
  window.dispatchEvent(event);
};

const showSuccessToast = (message: string) => {
  const event = new CustomEvent("showToast", {
    detail: { type: "success", title: "Success", message },
  });
  window.dispatchEvent(event);
};

interface TimetableState {
  timetables: Timetable[];
  schoolTimetables: Timetable[];
  selectedTimetable: Timetable[] | null;
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  editingEntry: Entry | null;

  // Actions
  fetchSchoolTimetables: (schoolId: string) => Promise<Timetable[]>;
  fetchClassTimetable: (sectionId: string) => Promise<Timetable>;
  createTimetable: (data: CreateTimetableData) => Promise<Timetable | undefined>;
  updateTimetable: (
    timetableId: string,
    data: UpdateTimetableData
  ) => Promise<Timetable | undefined>;
  deleteTimetable: (timetableId: string) => Promise<Timetable>;
  createEntry: (data: CreateEntryData) => Promise<Entry | undefined>;
  updateEntry: (entryId: string, data: UpdateEntryData) => Promise<Entry | undefined>;
  deleteEntry: (entryId: string) => Promise<Entry>;
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
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.getSchoolTimetables(schoolId);
      if (response.success && response.data) {
        set({
          timetables: response.data.data,
          schoolTimetables: response.data.data,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch timetables.");
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      showErrorToast(err.message);
    }
  },

  fetchClassTimetable: async (sectionId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.getClassTimetable(sectionId);
      if (response.success && response.data) {
        set({ selectedTimetable: response.data, isLoading: false });
      } else {
        set({ selectedTimetable: null, isLoading: false });
        if (response.message) showErrorToast(response.message);
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      showErrorToast(err.message);
    }
  },

  createTimetable: async (data: CreateTimetableData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.createTimetable(data);
      if (response.success && response.data) {
        set({ isLoading: false });
        showSuccessToast("Timetable created successfully!");
        await get().fetchSchoolTimetables(data.schoolId);
        return response.data.data;
      } else {
        throw new Error(response.message || "Failed to create timetable.");
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      showErrorToast(err.message);
      return undefined;
    }
  },

  updateTimetable: async (timetableId: string, data: UpdateTimetableData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.updateTimetable(timetableId, data);
      if (response.success && response.data) {
        set({ isLoading: false });
        showSuccessToast("Timetable updated successfully!");
        if (data.schoolId) {
          await get().fetchSchoolTimetables(data.schoolId);
        }
        return response.data.data;
      } else {
        throw new Error(response.message || "Failed to update timetable.");
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      showErrorToast(err.message);
      return undefined;
    }
  },

  deleteTimetable: async (timetableId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.deleteTimetable(timetableId);
      if (response.success) {
        set((state) => ({
          isLoading: false,
          timetables: state.timetables.filter((t) => t.id !== timetableId),
          selectedTimetable:
            state.selectedTimetable?.id === timetableId ? null : state.selectedTimetable,
        }));
        showSuccessToast("Timetable deleted successfully!");
      } else {
        throw new Error(response.message || "Failed to delete timetable.");
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      showErrorToast(err.message);
    }
  },

  createEntry: async (data: CreateEntryData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.createEntry(data);
      if (response.success && response.data) {
        const newEntry = response.data.data;
        set((state) => {
          if (!state.selectedTimetable) return {};
          return {
            selectedTimetable: {
              ...state.selectedTimetable,
              entries: [...state.selectedTimetable.entries, newEntry],
            },
            isLoading: false,
          };
        });
        showSuccessToast("Entry created successfully!");
        get().closeModal();
        return newEntry;
      } else {
        throw new Error(response.message || "Failed to create entry.");
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      showErrorToast(err.message);
      return undefined;
    }
  },

  updateEntry: async (entryId: string, data: UpdateEntryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await timetableService.updateEntry(entryId, data);
      if (response.success && response.data) {
        const updatedEntry = response.data.data;
        set((state) => ({
          schoolTimetables: state.schoolTimetables.map((timetable) =>
            timetable.id === updatedEntry.timetableId
              ? {
                  ...timetable,
                  entries: timetable.entries.map((entry) =>
                    entry.id === updatedEntry.id ? updatedEntry : entry
                  ),
                }
              : timetable
          ),
          isLoading: false,
        }));
        return true;
      } else {
        set({ error: response.message, isLoading: false });
        return false;
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },


  deleteEntry: async (entryId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.deleteEntry(entryId);
      if (response.success) {
        set((state) => {
          if (!state.selectedTimetable) return { isLoading: false };
          return {
            selectedTimetable: {
              ...state.selectedTimetable,
              entries: state.selectedTimetable.entries.filter((e) => e.id !== entryId),
            },
            isLoading: false,
          };
        });
        showSuccessToast("Entry deleted successfully!");
      } else {
        throw new Error(response.message || "Failed to delete entry.");
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      showErrorToast(err.message);
    }
  },

  selectTimetable: (timetable: Timetable | null) => {
    set({ selectedTimetable: timetable });
  },

  openModal: (entry?: Entry) => {
    set({ isModalOpen: true, editingEntry: entry ?? null });
  },

  closeModal: () => {
    set({ isModalOpen: false, editingEntry: null });
  },
}));
