'use client';

import { useEffect, useState } from 'react';
import type { OutletDto } from '@fieldapp/shared';
import { extractOutletErrorMessage, getOutlet } from '@/lib/outlets';

export function useOutlet(id: string) {
  const [data, setData] = useState<OutletDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const outlet = await getOutlet(id);
        if (active) setData(outlet);
      } catch (err) {
        if (active) setError(extractOutletErrorMessage(err, 'Unable to load outlet details'));
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [id]);

  return { data, loading, error };
}
