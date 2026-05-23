import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';
import type { ApiResponse, CheckInDto, NearbyOutletDto, PaginatedResponse } from '@fieldapp/shared';

export function useNearbyOutlets(latitude: number | null, longitude: number | null, radius?: number) {
  return useQuery({
    queryKey: ['nearby-outlets', latitude, longitude, radius],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<NearbyOutletDto[]>>('/me/outlets/nearby', {
        params: { latitude, longitude, radius },
      });
      return data.data;
    },
    enabled: latitude !== null && longitude !== null,
  });
}

export function useCheckInHistory(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['check-in-history', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<PaginatedResponse<CheckInDto>>>('/me/check-ins', {
        params: { page, limit },
      });
      return data.data;
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      outletId: string;
      assignmentId?: string;
      latitude: number;
      longitude: number;
      photoUrl?: string;
    }) => {
      const { data } = await apiClient.post<ApiResponse<CheckInDto>>('/me/check-in', params);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-in-history'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    },
  });
}
