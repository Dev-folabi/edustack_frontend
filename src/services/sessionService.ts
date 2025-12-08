import { apiClient, ApiResponse } from "../utils/api";

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
  getSessionById: (sessionId: string, schoolId: string): Promise<unknown> => {
    return apiClient.get(`/session/${sessionId}?schoolId=${schoolId}`);
  },

  // Get the active academic session
  getActiveSession: (schoolId: string): Promise<unknown> => {
    return apiClient.get<Session>(`/session?schoolId=${schoolId}`);
  },

  // Get all academic sessions
  getSessions: (schoolId?: string): Promise<ApiResponse<SessionsResponse>> => {
    const url = schoolId ? `/session/all?schoolId=${schoolId}` : "/session/all";
    return apiClient.get<SessionsResponse>(url);
  },

  // Create a new session
  createSession: (
    data: CreateSessionData,
    schoolId: string
  ): Promise<unknown> => {
    return apiClient.post("/session", { ...data, schoolId });
  },

  // Update a session by its ID
  updateSession: (
    sessionId: string,
    data: UpdateSessionData,
    schoolId: string
  ): Promise<unknown> => {
    return apiClient.put(`/session/${sessionId}`, { ...data, schoolId });
  },

  // Delete a session by its ID
  deleteSession: (sessionId: string, schoolId: string): Promise<any> => {
    return apiClient.delete(`/session/${sessionId}?schoolId=${schoolId}`);
  },

  // Get all terms for a specific session
  getSessionTerms: (sessionId: string, schoolId: string): Promise<any> => {
    return apiClient.get(`/session/${sessionId}/terms?schoolId=${schoolId}`);
  },

  // Delete a specific term by its ID
  deleteTerm: (termId: string, schoolId: string): Promise<any> => {
    return apiClient.delete(`/session/term/${termId}?schoolId=${schoolId}`);
  },
};
