import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';
import type { MyTasksQueryParams, PaginatedResponse, MyTaskAssignmentDto } from '@fieldapp/shared';

export function useMyTasks(params: MyTasksQueryParams = {}) {
  return useQuery({
    queryKey: ['my-tasks', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<MyTaskAssignmentDto>>('/me/tasks', { params });
      return data;
    },
  });
}

export function useMyTaskDetail(taskId: string) {
  return useQuery({
    queryKey: ['my-task', taskId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/me/tasks/${taskId}`);
      return data.data;
    },
    enabled: !!taskId,
  });
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, status, notes }: { assignmentId: string; status: string; notes?: string }) => {
      const { data } = await apiClient.patch(`/me/task-assignments/${assignmentId}/status`, { status, notes });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-task'] });
    },
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      taskId: string;
      assignmentId: string;
      checklistData: Record<string, unknown>;
      photos: string[];
      notes?: string;
      rating?: number;
    }) => {
      const { data } = await apiClient.post('/me/reports', params);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-task'] });
    },
  });
}

export function useUploadReportPhoto() {
  return useMutation({
    mutationFn: async ({ reportId, uri }: { reportId: string; uri: string }) => {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', { uri, name: filename, type } as unknown as Blob);
      const { data } = await apiClient.post(`/me/reports/${reportId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
  });
}
