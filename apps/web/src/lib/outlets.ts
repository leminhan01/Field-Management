import apiClient from './api-client';
import type {
  CreateOutletInput,
  OutletDto,
  OutletQueryParams,
  PaginatedResponse,
  UpdateOutletInput,
} from '@fieldapp/shared';

function normalizeErrorMessage(message: unknown): string | null {
  if (typeof message === 'string' && message.trim()) return message;

  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );
    return messages.length ? messages.join('\n') : null;
  }

  return null;
}

export function extractOutletErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as {
      response?: {
        data?: {
          message?: unknown;
          error?: { message?: unknown; details?: unknown };
        };
      };
    };

    return normalizeErrorMessage(axiosErr.response?.data?.message)
      || normalizeErrorMessage(axiosErr.response?.data?.error?.message)
      || normalizeErrorMessage(axiosErr.response?.data?.error?.details)
      || fallback;
  }

  if (err instanceof Error) return err.message;
  return fallback;
}

export async function getOutlets(params?: OutletQueryParams) {
  const { data } = await apiClient.get('/outlets', { params });
  return data.data as PaginatedResponse<OutletDto>;
}

export async function createOutlet(input: CreateOutletInput) {
  const { data } = await apiClient.post<{ success: boolean; data: OutletDto }>('/outlets', input);
  return data.data;
}

export async function updateOutlet(id: string, input: UpdateOutletInput) {
  const { data } = await apiClient.patch<{ success: boolean; data: OutletDto }>(`/outlets/${id}`, input);
  return data.data;
}

export async function deleteOutlet(id: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(`/outlets/${id}`);
  return data.data;
}
