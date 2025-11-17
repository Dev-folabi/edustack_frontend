
import { apiClient } from "./apiClient";

interface GetInvoicesParams {
  studentId: string;
  schoolId: string;
}

export const invoiceService = {
  getInvoices: async (params: GetInvoicesParams) => {
    const response = await apiClient.get("/accounting/invoices", {
      params,
    });
    return response.data;
  },
};
