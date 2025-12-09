export interface Staff {
  user?: any;
  id: string;
  email: string;
  username: string;
  name: string;
  phone: string[];
  address: string;
  role: "admin" | "teacher" | "finance" | "librarian";
  designation: string;
  dob?: string;
  salary: number;
  joining_date: string;
  gender: "male" | "female";
  isActive: boolean;
  qualification: string;
  notes?: string;
  photo_url?: string;
  schoolId: string;
  userId: string;
  currentClass?: string;
  currentSection?: string;
  admissionNumber?: string;
  admission_date?: string;
}

export type StaffRegistrationPayload = Omit<
  Staff,
  "id" | "schoolId" | "userId"
> & {
  schoolId?: string;
  password?: string;
};
