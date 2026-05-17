import apiClient from './api-client';
import type {
  EmployeeDto,
  EmployeeQueryParams,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  PaginatedResponse,
  ImportResult,
} from '@fieldapp/shared';

export async function getEmployees(params?: EmployeeQueryParams) {
  const { data } = await apiClient.get('/employees', { params });
  // TransformInterceptor wraps: { success: true, data: { data: [...], meta: {...} } }
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
