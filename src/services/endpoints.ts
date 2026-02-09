/**
 * Endpoints del backend (centralizados).
 * Ajusta aquí cuando cambie el back.
 * La URL base viene de EXPO_PUBLIC_API_URL (ej: http://localhost:3000/api).
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  users: {
    me: '/users/me',
  },
} as const;

/**
 * URL completa del login (base + endpoint).
 * Usa la misma base que http.ts para consistencia.
 */
export function getLoginUrl(): string {
  const base =
    process.env.EXPO_PUBLIC_API_URL?.startsWith('http')
      ? process.env.EXPO_PUBLIC_API_URL
      : 'http://localhost:3000/api';
  return `${base.replace(/\/$/, '')}${endpoints.auth.login}`;
}
