
import { apiClient } from "./apiClient";

interface StudentTermReportParams {
  studentId: string;
  termId: string;
  sessionId: string;
}

export const reportService = {
  getStudentTermReport: async (params: StudentTermReportParams) => {
    const response = await apiClient.get("/reports/student-term-report", {
      params,
    });
    return response.data;
  },
};
