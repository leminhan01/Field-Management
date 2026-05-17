'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';
import { setTokens, clearTokens } from '@/lib/auth';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, logout: storeLogout } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAuthenticated && isLoading) {
      apiClient
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          setUser(null);
        });
    }
  }, [isAuthenticated, isLoading, setUser]);

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    setTokens(data.data.accessToken, data.data.refreshToken);
    setUser(data.data.user);
    const redirect = searchParams.get('redirect') || '/dashboard';
    router.push(redirect);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearTokens();
      storeLogout();
      router.push('/login');
    }
  };

  return { user, isAuthenticated, isLoading, login, logout };
}
