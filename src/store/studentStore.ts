import { create } from 'zustand';
import { studentService, StudentFilters, PaginatedStudents } from '@/services/studentService';
import { Student } from '@/types/student';

interface StudentState {
  students: Student[];
  paginatedStudents: PaginatedStudents | null;
  loading: boolean;
  error: string | null;
  fetchStudentsBySection: (schoolId: string, sectionId: string) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set) => ({
  students: [],
  paginatedStudents: null,
  loading: false,
  error: null,
  fetchStudentsBySection: async (schoolId: string, sectionId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await studentService.getStudentsBySection(schoolId, { sectionId, limit: 1000 });
      if (response.data.success) {
        set({
          students: response.data.data.data,
          paginatedStudents: response.data.data,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch students' });
    }
  },
}));
