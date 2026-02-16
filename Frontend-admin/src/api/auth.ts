import { ADMIN_API } from './config';
import type { LoginResponse, LoginErrorResponse } from '@/types/auth';

const LOGIN_URL = `${ADMIN_API}/login`;
const LOGOUT_URL = `${ADMIN_API}/logout`;

/** Messaggio restituito quando il backend non è raggiungibile (rete / server spento). */
export const BACKEND_UNREACHABLE_MESSAGE =
  'Impossibile raggiungere il server. Verifica la connessione e che il backend sia avviato.';

export interface LoginCredentials {
  login: string;
  password: string;
}

/**
 * Login: sends credentials, returns token and user.
 * Token must be stored in memory only (handled by AuthContext).
 * On network error returns { success: false, message: BACKEND_UNREACHABLE_MESSAGE }.
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse | LoginErrorResponse> {
  let res: Response;
  try {
    res = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'same-origin',
    });
  } catch {
    return { success: false, message: BACKEND_UNREACHABLE_MESSAGE };
  }

  let data: LoginResponse | LoginErrorResponse;
  try {
    const text = await res.text();
    data = text ? (JSON.parse(text) as LoginResponse | LoginErrorResponse) : { success: false, message: '' };
  } catch {
    return { success: false, message: BACKEND_UNREACHABLE_MESSAGE };
  }

  if (!res.ok) {
    return {
      success: false,
      message: (data as LoginErrorResponse).message ?? 'Login failed.',
    };
  }

  return data as LoginResponse;
}

/**
 * Logout: revokes token on server. Call with current token (e.g. from memory).
 */
export async function logout(getToken: () => string | null): Promise<void> {
  const token = getToken();
  if (!token) return;

  try {
    await fetch(LOGOUT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });
  } finally {
    // Always clear local state; server revoke is best-effort
  }
}

/**
 * Validate session: call an authenticated endpoint; 401 means invalid/expired.
 */
export async function validateToken(getToken: () => string | null): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  const res = await fetch(`${ADMIN_API}/messages?page=0&size=1`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'same-origin',
  });

  if (res.status === 401) return false;
  if (!res.ok) return false;
  return true;
}

export { adminFetch } from './authClient';
