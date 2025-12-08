export enum ExpenseCategory {
  UTILITIES = "UTILITIES",
  SUPPLIES = "SUPPLIES",
  MAINTENANCE = "MAINTENANCE",
  SALARIES = "SALARIES",
  TRANSPORT = "TRANSPORT",
  MARKETING = "MARKETING",
  OTHER = "OTHER",
}

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialOverview {
  // Legacy top-level fields (keep optional for safety)
  totalRevenue?: number;
  totalExpenses?: number;
  netProfit?: number;
  revenueByFeeCategory?: RevenueByFeeCategory[];
  expensesByCategory?: ExpensesByCategory[];

  // Current API shape fields
  summary?: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalPayments?: number;
    expenseCount?: number;
    netIncome?: number;
    totalInvoices?: number;
    totalInvoiceAmount?: number;
    totalAmountPaid?: number;
    totalAmountDue?: number;
  };
  invoiceStatusBreakdown?: any[];
  expenseCategoryBreakdown?: any[];
  recentTransactions?: any[];
}

export interface RevenueByFeeCategory {
  feeCategory: string;
  total: number;
}

export interface ExpensesByCategory {
  category: ExpenseCategory;
  total: number;
}

export interface CreateExpensePayload {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  schoolId: string;
}

export interface UpdateExpensePayload {
  title?: string;
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  expenseDate?: string;
}

export interface FeeCategory {
  id: string;
  name: string;
  description: string;
  schoolId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type InvoiceStatus =
  | "UNPAID"
  | "PAID"
  | "PARTIALLY_PAID"
  | "OVERDUE"
  | "CANCELLED";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  feeCategoryId: string;
  description?: string | null;
  amount: number;
  createdAt: string;
  updatedAt: string;
  feeCategory?: FeeCategory;
}

export interface Term {
  id: string;
  name: string;
  sessionId?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  resumptionDate?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  id: string;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentPayload {
  studentInvoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  schoolId: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  studentInvoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string | null;
  paidAt?: string | null;
  schoolId: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  studentInvoice: StudentInvoice;
}

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
export interface StudentInvoice {
  id: string;
  assignedAt: string;
  assignedBy: string;
  invoice: Invoice;
  perStudentTotal: number;
  amountPaid: number;
  amountDue: number;
  totalAmount: number;
  status: InvoiceStatus;
  student: {
    id: string;
    name: string;
    admission_number: number;
    email: string;
    phone: string;
  };
  payments?: Payment[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  allowPartialPayment: boolean;
  schoolId: string;
  termId?: string | null;
  sessionId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  invoiceItems: InvoiceItem[];
  term?: Term;
  session?: Session;
  totalAmount?: number;
  amountPaid?: number;
  amountDue?: number;
  studentInvoicesCount?: number;

  studentInvoices?: StudentInvoice[];
}

export interface CreateFeeCategoryPayload {
  name: string;
  description: string;
  schoolId: string;
}

export interface UpdateFeeCategoryPayload {
  name?: string;
  description?: string;
}

export interface CreateInvoicePayload {
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
  assignmentType: "SINGLE_STUDENT" | "MULTIPLE_STUDENTS" | "CLASS" | "SECTION";
  studentIds?: string[];
  classId?: string;
  sectionId?: string;
}

export interface UpdateInvoicePayload {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: "UNPAID" | "PAID" | "PARTIALLY_PAID" | "OVERDUE" | "CANCELLED";
  allowPartialPayment?: boolean;
}
