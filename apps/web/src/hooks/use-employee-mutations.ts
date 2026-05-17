'use client';

import { useCallback } from 'react';
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployees,
} from '@/lib/employees';
import type { CreateEmployeeInput, UpdateEmployeeInput } from '@fieldapp/shared';

export function useEmployeeMutations() {
  const create = useCallback(async (input: CreateEmployeeInput) => {
    return createEmployee(input);
  }, []);

  const update = useCallback(async (id: string, input: UpdateEmployeeInput) => {
    return updateEmployee(id, input);
  }, []);

  const remove = useCallback(async (id: string) => {
    return deleteEmployee(id);
  }, []);

  const importFile = useCallback(async (file: File) => {
    return importEmployees(file);
  }, []);

  return { create, update, remove, importFile };
}
