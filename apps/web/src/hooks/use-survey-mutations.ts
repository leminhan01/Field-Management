'use client';

import { useCallback } from 'react';
import {
  createSurvey,
  updateSurvey,
  deleteSurvey,
  updateSurveyStatus,
} from '@/lib/surveys';
import type { CreateSurveyInput, UpdateSurveyInput } from '@fieldapp/shared';

export function useSurveyMutations() {
  const create = useCallback(async (input: CreateSurveyInput) => {
    return createSurvey(input);
  }, []);

  const update = useCallback(async (id: string, input: UpdateSurveyInput) => {
    return updateSurvey(id, input);
  }, []);

  const remove = useCallback(async (id: string) => {
    return deleteSurvey(id);
  }, []);

  const changeStatus = useCallback(async (id: string, status: string) => {
    return updateSurveyStatus(id, status);
  }, []);

  return { create, update, remove, changeStatus };
}
