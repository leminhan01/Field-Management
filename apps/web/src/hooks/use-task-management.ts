'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getTaskGroups,
  getTaskTemplateOptions,
  getTaskTemplates,
} from '@/lib/task-management';
import type {
  TaskGroupDto,
  TaskGroupQueryParams,
  TaskTemplateDto,
  TaskTemplateOptionDto,
  TaskTemplateQueryParams,
} from '@fieldapp/shared';

export function useTaskTemplates(params: TaskTemplateQueryParams = {}) {
  const [data, setData] = useState<TaskTemplateDto[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (p: TaskTemplateQueryParams) => {
    setLoading(true);
    try {
      const result = await getTaskTemplates(p);
      setData(result.data);
      setMeta(result.meta);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchData(params), params.search ? 300 : 0);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [params.page, params.limit, params.search, params.type, params.isActive, fetchData]);

  return { data, meta, loading, refetch: () => fetchData(params) };
}

export function useTaskGroups(params: TaskGroupQueryParams = {}) {
  const [data, setData] = useState<TaskGroupDto[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (p: TaskGroupQueryParams) => {
    setLoading(true);
    try {
      const result = await getTaskGroups(p);
      setData(result.data);
      setMeta(result.meta);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchData(params), params.search ? 300 : 0);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [params.page, params.limit, params.search, params.isActive, fetchData]);

  return { data, meta, loading, refetch: () => fetchData(params) };
}

export function useTaskTemplateOptions() {
  const [data, setData] = useState<TaskTemplateOptionDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getTaskTemplateOptions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
