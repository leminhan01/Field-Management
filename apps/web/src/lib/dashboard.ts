import apiClient from './api-client';
import type { DashboardOverviewDto } from '@fieldapp/shared';

export async function getDashboardOverview() {
  const { data } = await apiClient.get<{ success: boolean; data: DashboardOverviewDto }>('/dashboard');
  return data.data;
}
