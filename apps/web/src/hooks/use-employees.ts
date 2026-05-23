'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { extractErrorMessage, getEmployees } from '@/lib/employees';
import type { EmployeeDto, EmployeeQueryParams } from '@fieldapp/shared';

export function useEmployees(params: EmployeeQueryParams = {}) {
  const [data, setData] = useState<EmployeeDto[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (p: EmployeeQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getEmployees(p);
      setData(result.data);
      setMeta(result.meta);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Unable to load employees'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const delay = params.search ? 300 : 0;
    debounceRef.current = setTimeout(() => {
      fetchData(params);
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [params.page, params.limit, params.search, params.role, params.branchId, params.isActive, fetchData]);

  return { data, meta, loading, error, refetch: () => fetchData(params) };
}
