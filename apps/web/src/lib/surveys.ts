import apiClient from './api-client';
import { extractErrorMessage } from './employees';
import type {
  SurveyDto,
  SurveyQueryParams,
  CreateSurveyInput,
  UpdateSurveyInput,
  SurveyResponseDto,
  SurveyStatsDto,
  PaginatedResponse,
} from '@fieldapp/shared';

export { extractErrorMessage };

export async function getSurveys(params?: SurveyQueryParams) {
  const { data } = await apiClient.get('/surveys', { params });
  return data.data as PaginatedResponse<SurveyDto>;
}

export async function getSurvey(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: SurveyDto }>(`/surveys/${id}`);
  return data.data;
}

export async function createSurvey(input: CreateSurveyInput) {
  const { data } = await apiClient.post<{ success: boolean; data: SurveyDto }>('/surveys', input);
  return data.data;
}

export async function updateSurvey(id: string, input: UpdateSurveyInput) {
  const { data } = await apiClient.patch<{ success: boolean; data: SurveyDto }>(`/surveys/${id}`, input);
  return data.data;
}

export async function deleteSurvey(id: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(`/surveys/${id}`);
  return data.data;
}

export async function updateSurveyStatus(id: string, status: string) {
  const { data } = await apiClient.patch<{ success: boolean; data: SurveyDto }>(`/surveys/${id}/status`, { status });
  return data.data;
}

export async function getSurveyResponses(
  surveyId: string,
  params?: { page?: number; limit?: number },
) {
  const { data } = await apiClient.get(`/surveys/${surveyId}/responses`, { params });
  return data.data as PaginatedResponse<SurveyResponseDto>;
}

export async function getSurveyStats(surveyId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: SurveyStatsDto }>(`/surveys/${surveyId}/stats`);
  return data.data;
}
