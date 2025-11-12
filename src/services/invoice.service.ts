import { axiosInstance } from "@/lib/axios";
import { IInvoice } from "@/types/invoice";

export const invoiceService = {
  getInvoices: async (schoolId: string, params?: { studentId?: string }) => {
    const { data } = await axiosInstance.get<{ data: IInvoice[] }>(
      `/accounting/invoices/${schoolId}`,
      { params }
    );
    return data;
  },
};
