import { create } from "zustand";
import { sessionService } from "@/services/sessionService"; // Updated import
import type { Session } from "@/services/sessionService";

interface SessionState {
  sessions: Session[];
  selectedSession: Session | null;
  isLoading: boolean;
  fetchSessions: () => Promise<void>;
  setSelectedSession: (session: Session) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  selectedSession: null,
  isLoading: false,

  fetchSessions: async () => {
    try {
      set({ isLoading: true });
      const response = await sessionService.getSessions();
      // The API response has the array directly in the `data` property
      if (response.success && response.data) {
        const sessions = response.data; // Corrected data access
        // Find the active session to set as default
        const activeSession = sessions.find(s => s.isActive) || sessions[0] || null;
        set({
          sessions,
          selectedSession: activeSession,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      set({ isLoading: false });
    }
  },

  setSelectedSession: (session: Session) => {
    set({ selectedSession: session });
  },
}));
