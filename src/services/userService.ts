import { apiClient } from "../utils/api";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  staff?: {
    id: string;
    name: string;
    phone: string | string[];
    address: string;
    photo_url?: string;
    // Add other staff fields as needed
  };
  student?: {
    id: string;
    name: string;
    phone: string;
    address: string;
    photo_url?: string;
    // Add other student fields as needed
  };
  parent?: {
    id: string;
    name: string;
    phone: string;
    address: string;
    photo_url?: string;
    // Add other parent fields as needed
  };
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  name?: string;
  phone?: string | string[];
  address?: string;
  photo_url?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const userService = {
  // Get User Profile
  getUserProfile: (): Promise<ApiResponse<UserProfile>> =>
    apiClient.get("/user/profile"),

  // Update User Profile
  updateUserProfile: (
    data: UpdateProfileData
  ): Promise<ApiResponse<UserProfile>> => apiClient.put("/user/profile", data),
};
