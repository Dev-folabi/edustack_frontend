import { apiClient } from "../utils/api";

// Re-defining interfaces here for clarity, can be shared if needed
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

// Based on Postman `GET /api/session/all` response
// The `data` property is directly an array of sessions
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
  getTermsForSession: (sessionId: string): Promise<any> => {
    return apiClient.get(`/session/${sessionId}/terms`);
  },
};
