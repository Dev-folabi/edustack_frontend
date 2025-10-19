import { apiClient } from "../utils/api";

export interface Term {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  isActive: boolean;
}

export interface Session {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  isActive: boolean;
  terms: Term[];
}


interface SessionsResponse {
    data: Session[];
}

// Based on Postman `POST /api/session` body
export interface CreateSessionData {
    name: string;
    start_date: string;
    end_date: string;
    isActive: boolean;
    terms: Array<{
        name: string;
        start_date: string;
        end_date: string;
    }>;
}

export type UpdateSessionData = Partial<CreateSessionData>;

export const sessionService = {
  // Get a single session by its ID
  getSessionById: (sessionId: string): Promise<any> => {
    return apiClient.get(`/session/${sessionId}`);
  },

  // Get the active academic session
  getActiveSession: (): Promise<any> => {
    return apiClient.get<Session>("/session");
  },

  // Get all academic sessions
  getSessions: (): Promise<any> => {
    return apiClient.get<SessionsResponse>("/session/all");
  },

  // Create a new session
  createSession: (data: CreateSessionData): Promise<any> => {
    return apiClient.post("/session", data);
  },

  // Update a session by its ID
  updateSession: (sessionId: string, data: UpdateSessionData): Promise<any> => {
    return apiClient.put(`/session/${sessionId}`, data);
  },

  // Delete a session by its ID
  deleteSession: (sessionId: string): Promise<any> => {
    return apiClient.delete(`/session/${sessionId}`);
  },

  // Get all terms for a specific session
  getSessionTerms: (sessionId: string): Promise<any> => {
    return apiClient.get(`/session/${sessionId}/terms`);
  },

  // Delete a specific term by its ID
  deleteTerm: (termId: string): Promise<any> => {
    return apiClient.delete(`/session/term/${termId}`);
  },
};
