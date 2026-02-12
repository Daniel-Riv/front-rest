import { http } from './http';
import { endpoints } from './endpoints';
import type { LoginRequest, LoginResponse, AuthUser } from '@/types/auth';

type BackendLoginResponse = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user: AuthUser;
};

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await http.post<BackendLoginResponse>(
      endpoints.auth.login,
      payload
    );

    const accessToken = data.accessToken ?? data.token;
    if (!accessToken) {
      throw new Error('auth.missingToken');
    }

    return {
      accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };
  },

  async me() {
    const { data } = await http.get(endpoints.users.me);
    return data;
  },
};
