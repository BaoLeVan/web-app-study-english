import { api } from './api';
import type { LoginDto, RegisterDto, ForgotPasswordDto } from '@repo/types';
import type { AuthUser } from '@/stores/auth';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  login: (dto: LoginDto) => api<AuthResponse>('/auth/login', { method: 'POST', body: dto }),
  register: (dto: RegisterDto) =>
    api<AuthResponse>('/auth/register', { method: 'POST', body: dto }),
  forgotPassword: (dto: ForgotPasswordDto) =>
    api<{ ok: true }>('/auth/forgot-password', { method: 'POST', body: dto }),
  refresh: (refreshToken: string) =>
    api<AuthResponse>('/auth/refresh', { method: 'POST', body: { refreshToken } }),
  logout: (token: string) => api<{ ok: true }>('/auth/logout', { method: 'POST', token }),
};
