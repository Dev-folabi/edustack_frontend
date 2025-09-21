import { ApiResponse } from '@/types/exam';
import { GradeCriterion, PsychomotorSkill, GeneralSettings } from '@/types/examSettings';
import { handleApiError } from '@/utils/api';
import { api } from '@/utils/api';

const SETTINGS_BASE_URL = '/exam/settings';

export const getGradeCriteria = async (): Promise<ApiResponse<GradeCriterion[]>> => {
    try {
        const response = await api.get(`${SETTINGS_BASE_URL}/grades`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const getGeneralSettings = async (): Promise<ApiResponse<GeneralSettings>> => {
    try {
        const response = await api.get(`${SETTINGS_BASE_URL}/global`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const updateGeneralSettings = async (data: GeneralSettings): Promise<ApiResponse<GeneralSettings>> => {
    try {
        const response = await api.post(`${SETTINGS_BASE_URL}/global`, data);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const createGradeCriterion = async (data: Omit<GradeCriterion, 'id'>): Promise<ApiResponse<GradeCriterion>> => {
    try {
        const response = await api.post(`${SETTINGS_BASE_URL}/grades`, data);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const updateGradeCriterion = async (id: string, data: Partial<Omit<GradeCriterion, 'id'>>): Promise<ApiResponse<GradeCriterion>> => {
    try {
        const response = await api.put(`${SETTINGS_BASE_URL}/grades/${id}`, data);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const deleteGradeCriterion = async (id: string): Promise<ApiResponse<null>> => {
    try {
        const response = await api.delete(`${SETTINGS_BASE_URL}/grades/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const getPsychomotorSkills = async (): Promise<ApiResponse<PsychomotorSkill[]>> => {
    try {
        const response = await api.get(`${SETTINGS_BASE_URL}/psychomotor`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const createPsychomotorSkill = async (data: Omit<PsychomotorSkill, 'id'>): Promise<ApiResponse<PsychomotorSkill>> => {
    try {
        const response = await api.post(`${SETTINGS_BASE_URL}/psychomotor`, data);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const updatePsychomotorSkill = async (id: string, data: Partial<Omit<PsychomotorSkill, 'id'>>): Promise<ApiResponse<PsychomotorSkill>> => {
    try {
        const response = await api.put(`${SETTINGS_BASE_URL}/psychomotor/${id}`, data);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const deletePsychomotorSkill = async (id: string): Promise<ApiResponse<null>> => {
    try {
        const response = await api.delete(`${SETTINGS_BASE_URL}/psychomotor/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};
