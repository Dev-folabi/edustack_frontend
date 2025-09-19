export interface Student {
  id: string;
  name: string;
  admission_number: string;
  admission_date: string;
  email: string;
  username: string;
  gender: 'male' | 'female';
  dob: string;
  phone: string;
  address: string;
  religion: string;
  blood_group?: string;
  isActive: boolean;
  father_name: string;
  mother_name: string;
  father_occupation: string;
  mother_occupation: string;
  photo_url?: string;
  city?: string;
  state?: string;
  country?: string;
  class: { id: string; name: string };
  section: { id: string; name: string };
  parent?: {
    id: string;
    name: string;
    email: string;
    phone: string[];
  };
}

export interface StudentRegistrationPayload {
  email: string;
  password?: string;
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
  isActive?: boolean;
  religion: string;
  blood_group?: string;
  father_name: string;
  mother_name: string;
  father_occupation: string;
  mother_occupation: string;
  city?: string;
  state?: string;
  country?: string;
  route_vehicle_id?: string;
  room_id?: string;
  photo_url?: string;
  exist_guardian: boolean;
  guardian_name?: string;
  guardian_phone?: string[];
  guardian_email?: string;
  guardian_username?: string;
  guardian_password?: string;
  guardian_emailOrUsername?: string;
}
