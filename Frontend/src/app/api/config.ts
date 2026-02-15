/**
 * Base URL dell'API backend.
 * Imposta VITE_API_URL in .env (es. http://localhost:8080) per il collegamento al backend.
 */
const env = typeof import.meta !== 'undefined' ? (import.meta as { env?: Record<string, string> }).env : undefined;
export const API_BASE = env?.VITE_API_URL ?? '';
