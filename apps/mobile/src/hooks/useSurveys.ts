import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';
import type {
  ApiResponse,
  SurveyDto,
  SurveyAnswers,
} from '@fieldapp/shared';

export function useMySurveys() {
  return useQuery({
    queryKey: ['my-surveys'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SurveyDto[]>>('/me/surveys');
      return data.data;
    },
  });
}

export function useMySurveyDetail(surveyId: string) {
  return useQuery({
    queryKey: ['my-survey', surveyId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SurveyDto>>(`/me/surveys/${surveyId}`);
      return data.data;
    },
    enabled: !!surveyId,
  });
}

export function useSubmitSurveyResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      surveyId: string;
      branchId: string;
      answers: SurveyAnswers;
    }) => {
      const { data } = await apiClient.post<ApiResponse<{ id: string }>>(
        `/me/surveys/${params.surveyId}/responses`,
        { branchId: params.branchId, answers: params.answers },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-surveys'] });
    },
  });
}
