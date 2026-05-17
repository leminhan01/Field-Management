'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getOutlets } from '@/lib/outlets';
import type { OutletDto, OutletQueryParams } from '@fieldapp/shared';

export function useOutlets(params: OutletQueryParams = {}) {
  const [data, setData] = useState<OutletDto[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (p: OutletQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getOutlets(p);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai danh sach outlet');
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
  }, [params.page, params.limit, params.search, params.type, params.branchId, params.isActive, fetchData]);

  return { data, meta, loading, error, refetch: () => fetchData(params) };
}
