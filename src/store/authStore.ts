import { create } from 'zustand';
import { tokenStorage } from '@/services/tokenStorage';
import { authApi } from '@/services/authApi';
import type { AuthUser, LoginRequest } from '@/types/auth';
import { getApiErrorMessage } from '@/services/http';
import { Alert } from 'react-native';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  bootstrap: () => Promise<void>;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  user: null,

  bootstrap: async () => {
    // Si ya hay token, intentamos recuperar usuario
    set({ status: 'loading' });
    const token = await tokenStorage.getAccessToken();
    if (!token) {
      set({ status: 'unauthenticated', user: null });
      return;
    }

    try {
      // Ajusta el shape del response del back si cambia
      const me = await authApi.me();
      set({ status: 'authenticated', user: me?.user ?? me ?? null });
    } catch (_e) {
      await tokenStorage.clearTokens();
      set({ status: 'unauthenticated', user: null });
    }
  },

  login: async (payload) => {
    set({ status: 'loading' });
    try {
      const res = await authApi.login(payload);
      await tokenStorage.setTokens(res.accessToken, res.refreshToken);
      set({ status: 'authenticated', user: res.user });
    } catch (e) {
      set({ status: 'unauthenticated', user: null });
      Alert.alert('Login', getApiErrorMessage(e));
    }
  },

  logout: async () => {
    set({ status: 'loading' });
    await tokenStorage.clearTokens();
    set({ status: 'unauthenticated', user: null });
  },
}));
