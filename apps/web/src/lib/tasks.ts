import apiClient from './api-client';
import type { PaginatedResponse, TaskDetailDto, TaskDto, TaskQueryParams } from '@fieldapp/shared';

function normalizeErrorMessage(message: unknown): string | null {
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message)) {
    const messages = message.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    return messages.length ? messages.join('\n') : null;
  }
  return null;
}

export function extractTaskErrorMessage(err: unknown, fallback: string): string {
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

export async function getTasks(params?: TaskQueryParams) {
  const { data } = await apiClient.get('/tasks', { params });
  return data.data as PaginatedResponse<TaskDto>;
}

export async function deleteTask(id: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(`/tasks/${id}`);
  return data.data;
}

export async function getTask(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: TaskDetailDto }>(`/tasks/${id}`);
  return data.data;
}
