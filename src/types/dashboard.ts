export interface OverviewStats {
  totalStudents: number;
  activeStudents: number;
  totalStaff: number;
  activeStaff: number;
  totalClasses: number;
  totalSections: number;
}

export interface AcademicInfo {
  currentSession: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    isActive: boolean;
  };
  currentTerm: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    isActive: boolean;
  } | null;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalInvoices: number;
  totalInvoiceAmount: number;
  totalAmountPaid: number;
  totalAmountDue: number;
  collectionRate: number;
}

export interface StudentBreakdown {
  byGender: {
    gender: "male" | "female";
    count: number;
  }[];
  byClass: {
    classId: string;
    className: string;
    studentCount: number;
    sections: {
      sectionId: string;
      sectionName: string;
      studentCount: number;
    }[];
  }[];
}

export interface StaffBreakdown {
  byRole: {
    role: string;
    count: number;
  }[];
  byGender: {
    gender: "male" | "female";
    count: number;
  }[];
}

export interface RecentAdmission {
  id: string;
  name: string;
  admissionNumber: string;
  admission_date: string;
  gender: "male" | "female";
  class: {
    id: string;
    name: string;
  };
  section: {
    id: string;
    name: string;
  };
  photo_url: string | null;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventType: "exam" | "holiday" | "meeting" | "other";
}

export interface ExaminationsStats {
  upcomingExams: number;
  ongoingExams: number;
  completedExams: number;
  pendingResults: number;
}

export interface AttendanceStats {
  todayPresent: number;
  todayAbsent: number;
  todayTotal: number;
  attendanceRate: number;
  lastUpdated: string;
}

export interface InquiriesStats {
  total: number;
  pending: number;
  contacted: number;
  converted: number;
}

export interface SchoolDashboardData {
  overview: OverviewStats;
  academicInfo: AcademicInfo;
  financialSummary: FinancialSummary;
  studentBreakdown: StudentBreakdown;
  staffBreakdown: StaffBreakdown;
  recentAdmissions: RecentAdmission[];
  upcomingEvents: UpcomingEvent[];
  examinations: ExaminationsStats;
  attendance: AttendanceStats;
  inquiries: InquiriesStats;
}

export interface SchoolDashboardResponse {
  success: boolean;
  message: string;
  data: SchoolDashboardData;
}
