import { apiClient } from "../utils/api";

// ##############################
// #####  Type Definitions  #####
// ##############################

// Generic API Response
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Fee Category
interface FeeCategory {
  id: string;
  name: string;
  description: string;
}

// Invoice
interface Invoice {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  items: {
    id: string;
    description: string;
    amount: number;
  }[];
}

interface InvoiceCreationData {
  title: string;
  description: string;
  dueDate: string;
  termId: string;
  sessionId: string;
  schoolId: string;
  allowPartialPayment: boolean;
  items: {
    feeCategoryId: string;
    amount: number;
  }[];
  assignmentType: "SINGLE_STUDENT" | "CLASS" | "SECTION";
  studentIds?: string[];
  classId?: string;
  sectionId?: string;
}

// Payment
interface Payment {
  id: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
  status: string;
}

interface PaymentCreationData {
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
}

// Expense
interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
}

interface ExpenseCreationData {
  title: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
  schoolId: string;
}

// Payment Gateway
interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  isActive: boolean;
}

interface PaymentGatewayCreationData {
  name: string;
  provider: "PAYSTACK" | "FLUTTERWAVE";
  config: {
    publicKey: string;
    secretKey: string;
  };
}

// Webhook
interface WebhookData {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    customer: {
      email: string;
    };
    metadata: {
      invoiceId: string;
      studentId: string;
    };
  };
}


// Financial Overview Report
export interface FinancialOverview {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueByFeeCategory: {
    feeCategory: string;
    total: number;
  }[];
  expensesByCategory: {
    category: string;
    total: number;
  }[];
}

// Student Financial Report
interface StudentFinancialReport {
  student: {
    id: string;
    name: string;
  };
  invoices: {
    id: string;
    title: string;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    status: string;
  }[];
  payments: {
    id: string;
    amount: number;
    paymentMethod: string;
    status: string;
  }[];
}

// Payment Report
interface PaymentReport {
  totalPayments: number;
  totalAmount: number;
  paymentsByMethod: {
    paymentMethod: string;
    total: number;
  }[];
}

// ##########################
// #####  API Services  #####
// ##########################

export const financeService = {
  // ##### Reports #####

  getFinancialOverview: (
    schoolId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<FinancialOverview>> =>
    apiClient.get(
      `/accounting/reports/financial-overview/${schoolId}?startDate=${startDate}&endDate=${endDate}`
    ),

  getStudentFinancialReport: (
    studentId: string,
    schoolId: string
  ): Promise<ApiResponse<StudentFinancialReport>> =>
    apiClient.get(`/accounting/reports/student/${studentId}/${schoolId}`),

  getPaymentReport: (
    schoolId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<PaymentReport>> =>
    apiClient.get(
      `/accounting/reports/payments/${schoolId}?startDate=${startDate}&endDate=${endDate}`
    ),

  // ##### Fee Categories #####

  createFeeCategory: (data: {
    name: string;
    description?: string;
    schoolId: string;
  }): Promise<ApiResponse<FeeCategory>> =>
    apiClient.post("/accounting/fee-categories", data),

  getFeeCategories: (schoolId: string): Promise<ApiResponse<{ data: FeeCategory[] }>> =>
    apiClient.get(`/accounting/fee-categories/${schoolId}`),

  getFeeCategoryById: (
    schoolId: string,
    id: string
  ): Promise<ApiResponse<FeeCategory>> =>
    apiClient.get(`/accounting/fee-categories/${schoolId}/${id}`),

  updateFeeCategory: (
    id: string,
    data: { name?: string; description?: string }
  ): Promise<ApiResponse<FeeCategory>> =>
    apiClient.put(`/accounting/fee-categories/${id}`, data),

  deleteFeeCategory: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete(`/accounting/fee-categories/${id}`),

  // ##### Invoices #####

  createAndAssignInvoice: (data: InvoiceCreationData): Promise<ApiResponse<{ count: number }>> =>
    apiClient.post("/accounting/invoices/create-and-assign", data),

  getInvoices: (status?: string): Promise<ApiResponse<{ data: Invoice[] }>> =>
    apiClient.get(`/accounting/invoices${status ? `?status=${status}` : ""}`),

  getInvoiceById: (id: string): Promise<ApiResponse<Invoice>> =>
    apiClient.get(`/accounting/invoices/${id}`),

  updateInvoice: (id: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>> =>
    apiClient.put(`/accounting/invoices/${id}`, data),

  deleteInvoice: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete(`/accounting/invoices/${id}`),

  // ##### Payments #####

  createPayment: (data: PaymentCreationData): Promise<ApiResponse<Payment>> =>
    apiClient.post("/accounting/payments", data),

  getPayments: (status?: string): Promise<ApiResponse<{ data: Payment[] }>> =>
    apiClient.get(`/accounting/payments${status ? `?status=${status}` : ""}`),

  getPaymentById: (id: string): Promise<ApiResponse<Payment>> =>
    apiClient.get(`/accounting/payments/${id}`),

  updatePaymentStatus: (
    id: string,
    status: string
  ): Promise<ApiResponse<Payment>> =>
    apiClient.patch(`/accounting/payments/${id}/status`, { status }),

  // ##### Expenses #####

  createExpense: (data: ExpenseCreationData): Promise<ApiResponse<Expense>> =>
    apiClient.post("/accounting/expenses", data),

  getExpenses: (schoolId: string): Promise<ApiResponse<{ data: Expense[] }>> =>
    apiClient.get(`/accounting/expenses?schoolId=${schoolId}`),

  getExpenseById: (id: string): Promise<ApiResponse<Expense>> =>
    apiClient.get(`/accounting/expenses/${id}`),

  // ##### Payment Gateways #####

  createPaymentGateway: (
    schoolId: string,
    data: PaymentGatewayCreationData
  ): Promise<ApiResponse<PaymentGateway>> =>
    apiClient.post(`/accounting/payment-gateways/${schoolId}`, data),

  getPaymentGateways: (schoolId: string): Promise<ApiResponse<PaymentGateway[]>> =>
    apiClient.get(`/accounting/payment-gateways/${schoolId}`),

  // ##### Webhooks #####

  handlePaystackWebhook: (data: WebhookData): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post("/accounting/webhooks/paystack", data),
};
