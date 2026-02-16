/**
 * API base URL for admin backend (da .env: VITE_API_URL).
 * Deve coincidere con le origini CORS consentite dal backend.
 */
export const API_BASE = import.meta.env.VITE_API_URL as string | undefined;

export const ADMIN_API = API_BASE ? `${API_BASE}/api/admin` : '';
