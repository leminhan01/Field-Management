'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDashboardOverview } from '@/lib/dashboard';
import type { DashboardOverviewDto } from '@fieldapp/shared';

export function useDashboardOverview() {
  const [data, setData] = useState<DashboardOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDashboardOverview();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
