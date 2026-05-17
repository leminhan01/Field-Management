'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getBranches } from '@/lib/branches';
import type { BranchDto, BranchQueryParams } from '@fieldapp/shared';

export function useBranches(params: BranchQueryParams = {}) {
  const [data, setData] = useState<BranchDto[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (p: BranchQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getBranches(p);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách chi nhánh');
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
  }, [params.page, params.limit, params.search, params.type, params.regionId, params.isActive, fetchData]);

  return { data, meta, loading, error, refetch: () => fetchData(params) };
}
