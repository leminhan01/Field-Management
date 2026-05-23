import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';
import type {
  ApiResponse,
  MyTasksQueryParams,
  PaginatedResponse,
  MyTaskAssignmentDto,
  ReportDto,
} from '@fieldapp/shared';

export type MyTaskDetailDto = MyTaskAssignmentDto & {
  reports: Pick<ReportDto, 'id' | 'checklistData' | 'photos' | 'notes' | 'rating' | 'createdAt'>[];
};

export function useMyTasks(params: MyTasksQueryParams = {}) {
  return useQuery({
    queryKey: ['my-tasks', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<PaginatedResponse<MyTaskAssignmentDto>>>(
        '/me/tasks',
        { params },
      );
      return data.data;
    },
  });
}

export function useMyTaskDetail(taskId: string) {
  return useQuery({
    queryKey: ['my-task', taskId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<MyTaskDetailDto>>(`/me/tasks/${taskId}`);
      return data.data;
    },
    enabled: !!taskId,
  });
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, status, notes }: { assignmentId: string; status: string; notes?: string }) => {
      const { data } = await apiClient.patch<ApiResponse<{ message: string }>>(
        `/me/task-assignments/${assignmentId}/status`,
        { status, notes },
      );
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
      const { data } = await apiClient.post<ApiResponse<ReportDto>>('/me/reports', params);
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
      const { data } = await apiClient.post<ApiResponse<{ url: string }>>(`/me/reports/${reportId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
  });
}
