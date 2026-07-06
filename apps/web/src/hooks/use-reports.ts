'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdminReportDto, ReportQueryParams } from '@fieldapp/shared';
import { extractErrorMessage, getReports } from '@/lib/reports';

export function useReports(params: ReportQueryParams = {}) {
  const [data, setData] = useState<AdminReportDto[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (p: ReportQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getReports(p);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to load reports'));
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
  }, [params.page, params.limit, params.search, params.status, params.branchId, params.assigneeId, fetchData]);

  return { data, meta, loading, error, refetch: () => fetchData(params) };
}
