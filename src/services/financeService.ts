import { apiClient, ApiResponse } from "@/utils/api";
import {
  FeeCategory,
  CreateFeeCategoryPayload,
  UpdateFeeCategoryPayload,
  Invoice,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  PaymentStatus,
  Payment,
  CreatePaymentPayload,
  StudentInvoice,
  Expense,
  CreateExpensePayload,
  UpdateExpensePayload,
  FinancialOverview,
} from "@/types/finance";

export interface PaginatedResponse<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  prevPage: number | null;
  nextPage: number | null;
  itemPerPage: number;
  data: T[];
}

export const financeService = {
  // Fee Category Management
  createFeeCategory: (
    data: CreateFeeCategoryPayload
  ): Promise<ApiResponse<FeeCategory>> => {
    return apiClient.post("/accounting/fee-categories", data);
  },

  getFeeCategories: (
    schoolId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<FeeCategory>>> => {
    return apiClient.get(
      `/accounting/fee-categories/${schoolId}?page=${page}&limit=${limit}`
    );
  },

  getFeeCategoryById: (
    schoolId: string,
    id: string
  ): Promise<ApiResponse<FeeCategory>> => {
    return apiClient.get(`/accounting/fee-categories/${schoolId}/${id}`);
  },

  updateFeeCategory: (
    id: string,
    data: UpdateFeeCategoryPayload
  ): Promise<ApiResponse<FeeCategory>> => {
    return apiClient.put(`/accounting/fee-categories/${id}`, data);
  },

  deleteFeeCategory: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/accounting/fee-categories/${id}`);
  },

  // Invoice Management
  createInvoice: (
    data: CreateInvoicePayload
  ): Promise<ApiResponse<{ count: number }>> => {
    return apiClient.post("/accounting/invoices/create-and-assign", data);
  },

  getInvoices: (
    status: string = "",
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Invoice>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append("status", status);
    }
    return apiClient.get(`/accounting/invoices?${params.toString()}`);
  },

  getInvoicesByStudent: (
    studentId: string,
    schoolId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<StudentInvoice>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiClient.get(
      `/accounting/student-invoices/student/${studentId}/${schoolId}?${params.toString()}`
    );
  },

  getInvoiceById: (id: string): Promise<ApiResponse<Invoice>> => {
    return apiClient.get(`/accounting/invoices/${id}`);
  },

  updateInvoice: (
    id: string,
    data: UpdateInvoicePayload
  ): Promise<ApiResponse<Invoice>> => {
    return apiClient.put(`/accounting/invoices/${id}`, data);
  },

  deleteInvoice: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/accounting/invoices/${id}`);
  },

  // Payment Management
  createPayment: (
    data: CreatePaymentPayload
  ): Promise<ApiResponse<Payment>> => {
    return apiClient.post("/accounting/payments", data);
  },

  getPayments: (
    schoolId: string,
    status: string = "",
    studentId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Payment>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append("status", status);
    }
    if (studentId) {
      params.append("studentId", studentId);
    }
    return apiClient.get(
      `/accounting/payments/school/${schoolId}?${params.toString()}`
    );
  },

  getPaymentById: (id: string): Promise<ApiResponse<Payment>> => {
    return apiClient.get(`/accounting/payments/${id}`);
  },

  updatePaymentStatus: (
    id: string,
    status: PaymentStatus
  ): Promise<ApiResponse<Payment>> => {
    return apiClient.put(`/accounting/payments/${id}/status`, { status });
  },

  // Expense Management
  createExpense: (
    data: CreateExpensePayload
  ): Promise<ApiResponse<Expense>> => {
    return apiClient.post("/accounting/expenses", data);
  },

  getExpenses: (
    schoolId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Expense>>> => {
    return apiClient.get(
      `/accounting/expenses?schoolId=${schoolId}&page=${page}&limit=${limit}`
    );
  },

  getExpenseById: (id: string): Promise<ApiResponse<Expense>> => {
    return apiClient.get(`/accounting/expenses/${id}`);
  },

  updateExpense: (
    id: string,
    data: UpdateExpensePayload
  ): Promise<ApiResponse<Expense>> => {
    return apiClient.put(`/accounting/expenses/${id}`, data);
  },

  deleteExpense: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/accounting/expenses/${id}`);
  },

  // Reports
  getFinancialOverview: (
    schoolId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<FinancialOverview>> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return apiClient.get(
      `/accounting/reports/financial-overview/${schoolId}?${params.toString()}`
    );
  },

};
