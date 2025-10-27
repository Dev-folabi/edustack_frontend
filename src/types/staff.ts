export interface Staff {
  id: string;
  email: string;
  username: string;
  name: string;
  phone: string[];
  address: string;
  role: "admin" | "teacher" | "finance" | "librarian";
  designation: string;
  dob: string;
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
  admissionDate?: string;
}

export type StaffRegistrationPayload = Omit<Staff, "id" | "schoolId" | "userId"> & {
  password?: string;
};
