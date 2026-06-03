'use client';

import { useEffect, useState } from 'react';
import { getTask } from '@/lib/tasks';
import { extractTaskErrorMessage } from '@/lib/tasks';
import type { TaskDetailDto } from '@fieldapp/shared';

export function useTask(id: string | null) {
  const [data, setData] = useState<TaskDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getTask(id)
      .then(setData)
      .catch((err) => setError(extractTaskErrorMessage(err, 'Unable to load task details')))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}
