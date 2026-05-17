import apiClient from './api-client';
import type {
  AssignTaskGroupInput,
  CreateTaskGroupInput,
  CreateTaskTemplateInput,
  PaginatedResponse,
  TaskGroupDto,
  TaskGroupQueryParams,
  TaskTemplateDto,
  TaskTemplateOptionDto,
  TaskTemplateQueryParams,
  UpdateTaskGroupInput,
  UpdateTaskTemplateInput,
} from '@fieldapp/shared';

function normalizeErrorMessage(message: unknown): string | null {
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message)) {
    const messages = message.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    return messages.length ? messages.join('\n') : null;
  }
  return null;
}

export function extractTaskManagementErrorMessage(err: unknown, fallback: string): string {
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

export async function getTaskTemplates(params?: TaskTemplateQueryParams) {
  const { data } = await apiClient.get('/task-templates', { params });
  return data.data as PaginatedResponse<TaskTemplateDto>;
}

export async function getTaskTemplateOptions() {
  const { data } = await apiClient.get<{ success: boolean; data: TaskTemplateOptionDto[] }>('/task-templates');
  return data.data;
}

export async function createTaskTemplate(input: CreateTaskTemplateInput) {
  const { data } = await apiClient.post<{ success: boolean; data: TaskTemplateDto }>('/task-templates', input);
  return data.data;
}

export async function updateTaskTemplate(id: string, input: UpdateTaskTemplateInput) {
  const { data } = await apiClient.patch<{ success: boolean; data: TaskTemplateDto }>(`/task-templates/${id}`, input);
  return data.data;
}

export async function deleteTaskTemplate(id: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(`/task-templates/${id}`);
  return data.data;
}

export async function getTaskGroups(params?: TaskGroupQueryParams) {
  const { data } = await apiClient.get('/task-groups', { params });
  return data.data as PaginatedResponse<TaskGroupDto>;
}

export async function createTaskGroup(input: CreateTaskGroupInput) {
  const { data } = await apiClient.post<{ success: boolean; data: TaskGroupDto }>('/task-groups', input);
  return data.data;
}

export async function updateTaskGroup(id: string, input: UpdateTaskGroupInput) {
  const { data } = await apiClient.patch<{ success: boolean; data: TaskGroupDto }>(`/task-groups/${id}`, input);
  return data.data;
}

export async function deleteTaskGroup(id: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(`/task-groups/${id}`);
  return data.data;
}

export async function assignTaskGroup(id: string, input: AssignTaskGroupInput) {
  const { data } = await apiClient.post<{ success: boolean; data: { groupId: string; assignedTasks: unknown[] } }>(
    `/task-groups/${id}/assign`,
    input,
  );
  return data.data;
}
