import { axiosInstance } from "@/lib/axios";
import { IStudent } from "@/types/student";

export const studentService = {
  getStudents: async (schoolId: string) => {
    const { data } = await axiosInstance.get<{ data: IStudent[] }>(
      `/students/${schoolId}/all`
    );
    return data;
  },
};
