import { http } from './http';
import { endpoints } from './endpoints';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await http.post<LoginResponse>(endpoints.auth.login, payload);
    return data;
  },

  async me() {
    const { data } = await http.get(endpoints.users.me);
    return data;
  },
};
