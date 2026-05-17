'use client';

import { useCallback } from 'react';
import { createOutlet, deleteOutlet, updateOutlet } from '@/lib/outlets';
import type { CreateOutletInput, UpdateOutletInput } from '@fieldapp/shared';

export function useOutletMutations() {
  const create = useCallback(async (input: CreateOutletInput) => {
    return createOutlet(input);
  }, []);

  const update = useCallback(async (id: string, input: UpdateOutletInput) => {
    return updateOutlet(id, input);
  }, []);

  const remove = useCallback(async (id: string) => {
    return deleteOutlet(id);
  }, []);

  return { create, update, remove };
}
