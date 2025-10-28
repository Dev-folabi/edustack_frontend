export interface FeeCategory {
  id: string;
  name: string;
  description: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';
  totalAmount: number;
  paidAmount: number;
  balance: number;
  items: InvoiceItem[];
  allowPartialPayment: boolean;
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
  assignmentType: 'SINGLE_STUDENT' | 'MULTIPLE_STUDENTS' | 'CLASS' | 'SECTION';
  studentIds?: string[];
  classId?: string;
  sectionId?: string;
}

export interface UpdateInvoicePayload {
    title?: string;
    description?: string;
    dueDate?: string;
    status?: 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';
    allowPartialPayment?: boolean;
}
