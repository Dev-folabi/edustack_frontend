import { axiosInstance } from "@/lib/axios";
import { IPagination } from "@/types/pagination";

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CARD = "CARD",
  MOBILE_MONEY = "MOBILE_MONEY",
  CHEQUE = "CHEQUE",
}

export interface IPayment {
  id: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePaymentPayload {
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

export const paymentService = {
  getPayments: async (
    schoolId: string,
    params: {
      status?: PaymentStatus;
      page?: number;
      limit?: number;
    }
  ) => {
    const { data } = await axiosInstance.get<{
      data: IPayment[];
      pagination: IPagination;
    }>(`/accounting/payments/${schoolId}`, { params });
    return data;
  },

  createPayment: async (schoolId: string, payload: ICreatePaymentPayload) => {
    const { data } = await axiosInstance.post<{
      data: IPayment;
      message: string;
      success: boolean;
    }>(`/accounting/payments/${schoolId}`, payload);
    return data;
  },

  getPaymentById: async (schoolId: string, paymentId: string) => {
    const { data } = await axiosInstance.get<{
      data: IPayment;
      message: string;
      success: boolean;
    }>(`/accounting/payments/${schoolId}/${paymentId}`);
    return data;
  },

  updatePaymentStatus: async (
    schoolId: string,
    paymentId: string,
    status: PaymentStatus
  ) => {
    const { data } = await axiosInstance.patch<{
      data: IPayment;
      message: string;
      success: boolean;
    }>(`/accounting/payments/${schoolId}/${paymentId}/status`, { status });
    return data;
  },
};
