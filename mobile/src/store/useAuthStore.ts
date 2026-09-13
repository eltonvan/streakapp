import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { useHabitStore } from './useHabitStore';

const TOKEN_KEY = 'auth_token';
const BASE_URL = 'http://192.168.1.X:8000/api';

interface AuthStore {
  authToken: string | null;
  isAuthenticated: boolean;
  loadToken: () => Promise<void>;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authToken: null,
  isAuthenticated: false,

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        set({ authToken: token, isAuthenticated: true });
      }
    } catch {
      // token not found or error reading
    }
  },

  login: async (username, password) => {
    try {
      const response = await fetch(`${BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { success: false, error: (data as any).non_field_errors?.[0] || 'Invalid credentials' };
      }

      const data = await response.json();
      const token = data.token;
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      set({ authToken: token, isAuthenticated: true });
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  register: async (username, password) => {
    try {
      const response = await fetch(`${BASE_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errors = data as Record<string, string[]>;
        const first = Object.values(errors).flat()[0] || 'Registration failed';
        return { success: false, error: first };
      }

      const data = await response.json();
      const token = data.token;
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      set({ authToken: token, isAuthenticated: true });
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ authToken: null, isAuthenticated: false });
    useHabitStore.setState({ habits: [], logs: [] });
  },
}));