import apiClient from './api-client';
import type {
  BranchDto,
  BranchOptionDto,
  BranchQueryParams,
  CreateBranchInput,
  PaginatedResponse,
  UpdateBranchInput,
} from '@fieldapp/shared';

function normalizeErrorMessage(message: unknown): string | null {
  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );

    return messages.length ? messages.join('\n') : null;
  }

  return null;
}

export function extractBranchErrorMessage(err: unknown, fallback: string): string {
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

export async function getBranches(params?: BranchQueryParams) {
  const { data } = await apiClient.get('/branches', { params });
  return data.data as PaginatedResponse<BranchDto>;
}

export async function getBranchOptions() {
  const { data } = await apiClient.get<{ success: boolean; data: BranchOptionDto[] }>('/branches');
  return data.data;
}

export async function createBranch(input: CreateBranchInput) {
  const { data } = await apiClient.post<{ success: boolean; data: BranchDto }>('/branches', input);
  return data.data;
}

export async function updateBranch(id: string, input: UpdateBranchInput) {
  const { data } = await apiClient.patch<{ success: boolean; data: BranchDto }>(`/branches/${id}`, input);
  return data.data;
}

export async function deleteBranch(id: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(`/branches/${id}`);
  return data.data;
}
