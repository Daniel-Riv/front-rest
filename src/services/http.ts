import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { tokenStorage } from './tokenStorage';

const baseURL =
  process.env.EXPO_PUBLIC_API_URL?.startsWith('http')
    ? process.env.EXPO_PUBLIC_API_URL
    : 'http://localhost:3000/api';


export const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjuntar token a cada request
http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalizar errores
export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError<any>;
    return e.response?.data?.message ?? e.message ?? 'Error de red';
  }
  return 'Error inesperado';
}
