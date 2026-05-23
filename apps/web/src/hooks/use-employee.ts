'use client';

import { useState, useEffect } from 'react';
import { getEmployee } from '@/lib/employees';
import type { EmployeeDto } from '@fieldapp/shared';

export function useEmployee(id: string | null) {
  const [data, setData] = useState<EmployeeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getEmployee(id)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Unable to load employee details'))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}
