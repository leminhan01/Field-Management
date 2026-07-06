import apiClient from './api-client';
import { extractErrorMessage } from './employees';
import type {
  AdminReportDto,
  PaginatedResponse,
  ReportQueryParams,
  ReviewReportInput,
} from '@fieldapp/shared';

export { extractErrorMessage };

export async function getReports(params?: ReportQueryParams) {
  const { data } = await apiClient.get('/reports', { params });
  return data.data as PaginatedResponse<AdminReportDto>;
}

export async function getReport(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: AdminReportDto }>(`/reports/${id}`);
  return data.data;
}

export async function reviewReport(id: string, input: ReviewReportInput) {
  const { data } = await apiClient.patch<{ success: boolean; data: AdminReportDto }>(`/reports/${id}/review`, input);
  return data.data;
}
