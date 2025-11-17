
import { apiClient } from "./apiClient";

export const notificationService = {
  getNotifications: async () => {
    const response = await apiClient.get("/notify");
    return response.data;
  },
};
