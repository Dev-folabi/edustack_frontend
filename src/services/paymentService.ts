
import { apiClient } from "./apiClient";

interface GetPaymentsParams {
  studentId: string;
  schoolId: string;
}

export const paymentService = {
  getPayments: async (params: GetPaymentsParams) => {
    const response = await apiClient.get("/accounting/payments", {
      params,
    });
    return response.data;
  },
};
