import { create } from 'zustand';
import apiClient from '../services/api';
import { setTokens, clearTokens } from '../services/auth';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  branchId: string | null;
  branch: { id: string; name: string; code: string } | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    console.log('Calling login API for:', email);
    const { data } = await apiClient.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = data.data;
    console.log('Login API response:', data);
    await setTokens(accessToken, refreshToken);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore errors on logout
    }
    await clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
