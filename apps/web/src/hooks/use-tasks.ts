'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { extractTaskErrorMessage, getTasks } from '@/lib/tasks';
import type { TaskDto, TaskQueryParams } from '@fieldapp/shared';

export function useTasks(params: TaskQueryParams = {}) {
  const [data, setData] = useState<TaskDto[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (p: TaskQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTasks(p);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(extractTaskErrorMessage(err, 'Khong the tai danh sach cong viec'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchData(params);
    }, params.search ? 300 : 0);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    params.page,
    params.limit,
    params.search,
    params.type,
    params.status,
    params.branchId,
    params.outletId,
    params.assigneeId,
    params.dateFrom,
    params.dateTo,
    fetchData,
  ]);

  return { data, meta, loading, error, refetch: () => fetchData(params) };
}
