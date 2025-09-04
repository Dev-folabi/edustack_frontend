export interface StudentRegistration {
  email: string;
  password: string;
  username: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  name: string;
  gender: 'male' | 'female';
  dob: string;
  phone: string;
  address: string;
  admission_date: string;
  religion: string;
  blood_group: string;
  father_name: string;
  mother_name: string;
  father_occupation: string;
  mother_occupation: string;
  isActive: boolean;
  city: string;
  state: string;
  country: string;
  route_vehicle_id: string;
  room_id: string;
  added_by: string;
  photo_url: string;
  exist_guardian: boolean;
  guardian_name: string;
  guardian_phone: string[];
  guardian_email: string;
  guardian_username: string;
  guardian_password: string;
}

export interface StaffRegistration {
  email: string;
  password: string;
  username: string;
  name: string;
  phone: string[];
  address: string;
  schoolId: string;
  role: 'teacher' | 'accountant' | 'librarian';
  designation: string;
  dob: string;
  salary: number;
  joining_date: string;
  gender: 'male' | 'female';
  photo_url: string;
  isActive: boolean;
  qualification: string;
  notes: string;
  classSectionId: string;
}

export type RegistrationType = 'student' | 'staff';