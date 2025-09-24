import { ApiResponse } from "@/types/exam";
import {
  GradeCriterion,
  PsychomotorSkill,
  GeneralSettings,
} from "@/types/examSettings";
import { apiClient } from "@/utils/api";

const SETTINGS_BASE_URL = "/exam/settings";

export const getGradeCriteria = async (): Promise<
  ApiResponse<GradeCriterion[]>
> => {
  const response = await apiClient.get(`${SETTINGS_BASE_URL}/grades`);
  return response.data as ApiResponse<GradeCriterion[]>;
};

export const getGeneralSettings = async (): Promise<
  ApiResponse<GeneralSettings>
> => {
  const response = await apiClient.get(`${SETTINGS_BASE_URL}/global`);
  return response.data as ApiResponse<GeneralSettings>;
};

export const updateGeneralSettings = async (
  data: GeneralSettings
): Promise<ApiResponse<GeneralSettings>> => {
  const response = await apiClient.post(`${SETTINGS_BASE_URL}/global`, data);
  return response.data as ApiResponse<GeneralSettings>;
};

export const createGradeCriterion = async (
  data: Omit<GradeCriterion, "id">
): Promise<ApiResponse<GradeCriterion>> => {
  const response = await apiClient.post(`${SETTINGS_BASE_URL}/grades`, data);
  return response.data as ApiResponse<GradeCriterion>;
};

export const updateGradeCriterion = async (
  id: string,
  data: Partial<Omit<GradeCriterion, "id">>
): Promise<ApiResponse<GradeCriterion>> => {
  const response = await apiClient.put(
    `${SETTINGS_BASE_URL}/grades/${id}`,
    data
  );
  return response.data as ApiResponse<GradeCriterion>;
};

export const deleteGradeCriterion = async (
  id: string
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete(`${SETTINGS_BASE_URL}/grades/${id}`);
  return response.data as ApiResponse<null>;
};

export const getPsychomotorSkills = async (): Promise<
  ApiResponse<PsychomotorSkill[]>
> => {
  const response = await apiClient.get(`${SETTINGS_BASE_URL}/psychomotor`);
  return response.data as ApiResponse<PsychomotorSkill[]>;
};

export const createPsychomotorSkill = async (
  data: Omit<PsychomotorSkill, "id">
): Promise<ApiResponse<PsychomotorSkill>> => {
  const response = await apiClient.post(
    `${SETTINGS_BASE_URL}/psychomotor`,
    data
  );
  return response.data as ApiResponse<PsychomotorSkill>;
};

export const updatePsychomotorSkill = async (
  id: string,
  data: Partial<Omit<PsychomotorSkill, "id">>
): Promise<ApiResponse<PsychomotorSkill>> => {
  const response = await apiClient.put(
    `${SETTINGS_BASE_URL}/psychomotor/${id}`,
    data
  );
  return response.data as ApiResponse<PsychomotorSkill>;
};

export const deletePsychomotorSkill = async (
  id: string
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete(
    `${SETTINGS_BASE_URL}/psychomotor/${id}`
  );
  return response.data as ApiResponse<null>;
};
