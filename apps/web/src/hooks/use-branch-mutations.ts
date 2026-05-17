'use client';

import { useCallback } from 'react';
import { createBranch, deleteBranch, updateBranch } from '@/lib/branches';
import type { CreateBranchInput, UpdateBranchInput } from '@fieldapp/shared';

export function useBranchMutations() {
  const create = useCallback(async (input: CreateBranchInput) => {
    return createBranch(input);
  }, []);

  const update = useCallback(async (id: string, input: UpdateBranchInput) => {
    return updateBranch(id, input);
  }, []);

  const remove = useCallback(async (id: string) => {
    return deleteBranch(id);
  }, []);

  return { create, update, remove };
}
