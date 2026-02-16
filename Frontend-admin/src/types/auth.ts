export const ROLE_ADMIN = 'ROLE_ADMIN';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
}

export interface LoginResponse {
  success: true;
  token: string;
  user: AdminUser;
}

export interface LoginErrorResponse {
  success: false;
  message?: string;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  roles: string[];
  isAuthenticated: boolean;
  isVerifying: boolean;
}
