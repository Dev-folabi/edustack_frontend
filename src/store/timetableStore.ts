import { create } from "zustand";
import {
  timetableService,
  type Timetable,
  type Entry,
  type CreateTimetableData,
  type CreateEntryData,
  type UpdateEntryData,
} from "@/services/timetableService";
import { toast } from "react-toastify";

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
      toast.error(error.message);
    }
  },

  fetchClassTimetable: async (sectionId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.getClassTimetable(sectionId);
      if (response.success && response.data) {
        set({ selectedTimetable: response.data.data, isLoading: false });
      } else {
        // If no timetable is found, it's not necessarily an error to show to the user
        set({ selectedTimetable: null, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message);
    }
  },

  createTimetable: async (data: CreateTimetableData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.createTimetable(data);
      if (response.success && response.data) {
        set({ isLoading: false });
        toast.success("Timetable created successfully!");
        // Refetch timetables for the school
        get().fetchSchoolTimetables(data.schoolId);
        return response.data.data;
      } else {
        throw new Error(response.message || "Failed to create timetable.");
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message);
      return undefined;
    }
  },

  deleteTimetable: async (timetableId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.deleteTimetable(timetableId);
      if (response.success) {
        set({ isLoading: false });
        // Remove the deleted timetable from the list
        set((state) => ({
          timetables: state.timetables.filter((t) => t.id !== timetableId),
          selectedTimetable: state.selectedTimetable?.id === timetableId ? null : state.selectedTimetable,
        }));
        toast.success("Timetable deleted successfully!");
      } else {
        throw new Error(response.message || "Failed to delete timetable.");
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message);
    }
  },

  createEntry: async (data: CreateEntryData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.createEntry(data);
      if (response.success && response.data) {
        set({ isLoading: false });
        // Add the new entry to the selected timetable
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
        toast.success("Entry created successfully!");
        get().closeModal();
      } else {
        throw new Error(response.message || "Failed to create entry.");
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message);
    }
  },

  updateEntry: async (entryId: string, data: UpdateEntryData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.updateEntry(entryId, data);
      if (response.success && response.data) {
        set({ isLoading: false });
        // Update the entry in the selected timetable
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
        toast.success("Entry updated successfully!");
        get().closeModal();
      } else {
        throw new Error(response.message || "Failed to update entry.");
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message);
    }
  },

  deleteEntry: async (entryId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timetableService.deleteEntry(entryId);
      if (response.success) {
        set({ isLoading: false });
        // Remove the entry from the selected timetable
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
        toast.success("Entry deleted successfully!");
      } else {
        throw new Error(response.message || "Failed to delete entry.");
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message);
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
