'use client';

import { useState, useEffect } from 'react';
import { extractErrorMessage, getSurvey } from '@/lib/surveys';
import type { SurveyDto } from '@fieldapp/shared';

export function useSurvey(id: string | null) {
  const [data, setData] = useState<SurveyDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSurvey() {
      setLoading(true);
      setError(null);

      try {
        const result = await getSurvey(id!);
        if (!cancelled) setData(result);
      } catch (err: unknown) {
        if (!cancelled) setError(extractErrorMessage(err, 'Unable to load survey'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSurvey();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error };
}
