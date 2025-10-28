import { apiClient, ApiResponse } from '@/utils/api';
import {
  FeeCategory,
  CreateFeeCategoryPayload,
  UpdateFeeCategoryPayload,
  Invoice,
  CreateInvoicePayload,
  UpdateInvoicePayload,
} from '@/types/finance';

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
    return apiClient.post('/accounting/fee-categories', data);
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

  deleteFeeCategory: (id: string): Promise<ApiResponse<any>> => {
    return apiClient.delete(`/accounting/fee-categories/${id}`);
  },

  // Invoice Management
  createInvoice: (
    data: CreateInvoicePayload
  ): Promise<ApiResponse<{ count: number }>> => {
    return apiClient.post('/accounting/invoices', data);
  },

  getInvoices: (
    status: string = '',
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Invoice>>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (status) {
        params.append('status', status);
    }
    return apiClient.get(`/accounting/invoices?${params.toString()}`);
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

  deleteInvoice: (id: string): Promise<ApiResponse<any>> => {
    return apiClient.delete(`/accounting/invoices/${id}`);
  },
};
