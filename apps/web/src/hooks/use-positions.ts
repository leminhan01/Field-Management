'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPositionPermissions,
  getPositions,
} from '@/lib/positions';
import type { PermissionDto, PositionDto, PositionQueryParams } from '@fieldapp/shared';

export function usePositions(params: PositionQueryParams = {}) {
  const [data, setData] = useState<PositionDto[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [loading, setLoading] = useState(true);

  const stableParams = useMemo(() => params, [
    params.page,
    params.limit,
    params.search,
    params.isActive,
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [positionsResult, permissionsResult] = await Promise.all([
        getPositions(stableParams),
        getPositionPermissions(),
      ]);
      setData(positionsResult.data);
      setMeta(positionsResult.meta);
      setPermissions(permissionsResult);
    } finally {
      setLoading(false);
    }
  }, [stableParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, meta, permissions, loading, refetch: fetchData };
}
