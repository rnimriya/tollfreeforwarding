import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { tokenStorage } from '../lib/tokenStorage';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: tokenStorage.get(), // hydrate from dedicated storage on init

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        tokenStorage.set(data.token);
        set({ user: data.user, token: data.token });
      },

      register: async (formData) => {
        const { data } = await api.post('/auth/register', formData);
        tokenStorage.set(data.token);
        set({ user: data.user, token: data.token });
      },

      logout: () => {
        tokenStorage.clear();
        set({ user: null, token: null });
      },
    }),
    // Persist user profile only — token lives in tokenStorage (single source of truth)
    { name: 'auth', partialize: (s) => ({ user: s.user }) }
  )
);
