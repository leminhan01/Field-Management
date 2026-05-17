import apiClient from './api-client';
import type {
  EmployeeDto,
  EmployeeQueryParams,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  PaginatedResponse,
  ImportResult,
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

function extractErrorMessage(err: unknown, fallback: string): string {
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

export { extractErrorMessage };

export async function getEmployees(params?: EmployeeQueryParams) {
  const { data } = await apiClient.get('/employees', { params });
  return data.data as PaginatedResponse<EmployeeDto>;
}

export async function getEmployee(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: EmployeeDto }>(`/employees/${id}`);
  return data.data;
}

export async function createEmployee(input: CreateEmployeeInput) {
  const { data } = await apiClient.post<{ success: boolean; data: EmployeeDto }>('/employees', input);
  return data.data;
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  const { data } = await apiClient.patch<{ success: boolean; data: EmployeeDto }>(`/employees/${id}`, input);
  return data.data;
}

export async function deleteEmployee(id: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(`/employees/${id}`);
  return data.data;
}

export async function importEmployees(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ success: boolean; data: ImportResult }>('/employees/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function exportEmployees(params?: EmployeeQueryParams) {
  const response = await apiClient.get('/employees/export', {
    params,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'employees.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getBranches() {
  const { data } = await apiClient.get<{ success: boolean; data: Array<{ id: string; name: string; code: string }> }>('/branches');
  return data.data;
}

export async function uploadAvatar(employeeId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ success: boolean; data: EmployeeDto }>(
    `/employees/${employeeId}/avatar`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}
