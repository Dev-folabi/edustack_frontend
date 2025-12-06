import { create } from "zustand";
import { sessionService } from "@/services/sessionService";
import type { Session, Term } from "@/services/sessionService";
export type { Session, Term };

interface SessionState {
  sessions: Session[];
  selectedSession: Session | null;
  isLoading: boolean;
  fetchSessions: (schoolId: string) => Promise<void>;
  setSelectedSession: (session: Session) => void;
  fetchTerms: (sessionId: string, schoolId: string) => Promise<void>;
  terms: Term[];
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  selectedSession: null,
  isLoading: false,
  terms: [],

  fetchSessions: async (schoolId: string) => {
    try {
      set({ isLoading: true });
      const response = await sessionService.getSessions(schoolId);
      if (response.success && response.data) {
        const sessions = response.data.data;
        const activeSession =
          sessions.find((s: Session) => s.isActive) || sessions[0] || null;
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

  fetchTerms: async (sessionId: string, schoolId: string) => {
    try {
      set({ isLoading: true });
      const response = await sessionService.getSessionTerms(
        sessionId || "",
        schoolId
      );
      if (response.success && response.data) {
        const terms = response.data.data;
        set({
          terms,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch terms");
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
      set({ isLoading: false });
    }
  },
}));
