import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; } | null;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: () => set({ isAuthenticated: true, user: { name: 'Usuario' } }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));