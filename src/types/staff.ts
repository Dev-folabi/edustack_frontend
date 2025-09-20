export interface Staff {
    id: string;
    name: string;
    email: string;
    phone: string[];
    address: string;
    designation: string;
    dob: string;
    salary: number;
    joining_date: string;
    gender: string;
    photo_url?: string;
    qualification?: string;
    notes?: string;
    isActive: boolean;
    user: {
      username: string;
      email: string;
    };
  }
