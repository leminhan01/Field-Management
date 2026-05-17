import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  branchId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hydrated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  _hydrated: false,

  hydrate: () => {
    if (get()._hydrated) return;
    set({ _hydrated: true });
  },

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      _hydrated: true,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
