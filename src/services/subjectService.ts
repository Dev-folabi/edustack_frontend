import { UserRole } from '@/constants/roles';
import { get, post, put, del } from '@/utils/api';

export interface Subject {
  id: string;
  name: string;
  code: string;
  className: string;
  teacher: string;
  isActive: boolean;
  schoolIds: string[];
  sectionIds: string[];
}

export interface Teacher {
  id: string;
  name: string;
}


const BASE_URL = '/subjects';

export const subjectService = {
  getSubjects: async (filters = {}): Promise<any> => {
    // const query = new URLSearchParams(filters).toString();
    // return get(`${BASE_URL}?${query}`);
    // Mocked response
    console.log('Fetching subjects with filters:', filters);
    return Promise.resolve({
        totalItems: 3,
        totalPages: 1,
        currentPage: 1,
        prevPage: null,
        nextPage: null,
        itemPerPage: 10,
        data: [
            { id: '1', name: 'Mathematics', code: 'MATH101', className: 'Grade 10', teacher: 'Mr. Smith', isActive: true },
            { id: '2', name: 'Science', code: 'SCI101', className: 'Grade 10', teacher: 'Ms. Jones', isActive: true },
            { id: '3', name: 'History', code: 'HIST101', className: 'Grade 10', teacher: 'Mr. Doe', isActive: false },
        ]
    });
  },

  getSubject: async (id: string): Promise<any> => {
    // return get(`${BASE_URL}/${id}`);
    // Mocked response
    console.log(`Fetching subject with id: ${id}`);
    return Promise.resolve({
        id: '1', name: 'Mathematics', code: 'MATH101', className: 'Grade 10', teacher: 'Mr. Smith', isActive: true, schoolIds: ['school1'], sectionIds: ['section1']
    });
  },

  createSubject: async (data: Partial<Subject>): Promise<any> => {
    // return post(BASE_URL, data);
    // Mocked response
    console.log('Creating subject with data:', data);
    return Promise.resolve({ id: '4', ...data });
  },

  updateSubject: async (id: string, data: Partial<Subject>): Promise<any> => {
    // return put(`${BASE_URL}/${id}`, data);
    // Mocked response
    console.log(`Updating subject ${id} with data:`, data);
    return Promise.resolve({ id, ...data });
  },

  deleteSubject: async (id: string): Promise<any> => {
    // return del(`${BASE_URL}/${id}`);
    // Mocked response
    console.log(`Deleting subject with id: ${id}`);
    return Promise.resolve();
  },

  assignTeacher: async (subjectId: string, teacherId: string): Promise<any> => {
    // return put(`${BASE_URL}/${subjectId}/teacher`, { teacherId });
    // Mocked response
    console.log(`Assigning teacher ${teacherId} to subject ${subjectId}`);
    return Promise.resolve();
  },
};

export const staffService = {
    getAllStaff: async (): Promise<any> => {
        // return get('/staff');
        // Mocked response
        return Promise.resolve({
            totalItems: 3,
            totalPages: 1,
            currentPage: 1,
            prevPage: null,
            nextPage: null,
            itemPerPage: 10,
            data: [
                { id: '1', name: 'Mr. Smith', user: { role: UserRole.TEACHER } },
                { id: '2', name: 'Ms. Jones', user: { role: UserRole.TEACHER } },
                { id: '3', name: 'Mr. Doe', user: { role: UserRole.TEACHER } },
            ]
        });
    }
}
