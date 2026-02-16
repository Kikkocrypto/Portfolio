import { ADMIN_API } from './config';

type GetToken = () => string | null;
type OnUnauthorized = () => void;

let getToken: GetToken = () => null;
let onUnauthorized: OnUnauthorized = () => {};

/**
 * Register token getter and 401 handler. Called by AuthProvider on mount.
 * Enables auto-logout on 401 for all adminFetch requests.
 */
export function setAuthCallbacks(getTokenFn: GetToken, on401: OnUnauthorized): void {
  getToken = getTokenFn;
  onUnauthorized = on401;
}

/**
 * Authenticated fetch for admin API: adds Bearer token, calls onUnauthorized on 401.
 */
export async function adminFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${ADMIN_API}${path.startsWith('/') ? path : `/${path}`}`;
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...options, headers, credentials: 'same-origin' });
  if (res.status === 401) onUnauthorized();
  return res;
}
