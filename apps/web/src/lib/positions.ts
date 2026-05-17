import apiClient from './api-client';
import type {
  CreatePositionInput,
  PaginatedResponse,
  PermissionDto,
  PositionDto,
  PositionQueryParams,
  UpdatePositionInput,
} from '@fieldapp/shared';

export async function getPositions(params?: PositionQueryParams) {
  const { data } = await apiClient.get('/positions', { params });
  return data.data as PaginatedResponse<PositionDto>;
}

export async function getPositionPermissions() {
  const { data } = await apiClient.get<{ success: boolean; data: PermissionDto[] }>(
    '/positions/permissions',
  );
  return data.data;
}

export async function createPosition(input: CreatePositionInput) {
  const { data } = await apiClient.post<{ success: boolean; data: PositionDto }>(
    '/positions',
    input,
  );
  return data.data;
}

export async function updatePosition(id: string, input: UpdatePositionInput) {
  const { data } = await apiClient.patch<{ success: boolean; data: PositionDto }>(
    `/positions/${id}`,
    input,
  );
  return data.data;
}

export async function deletePosition(id: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(
    `/positions/${id}`,
  );
  return data.data;
}
