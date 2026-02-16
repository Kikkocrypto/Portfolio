import { useAuthContext } from '@/context/AuthContext';

/**
 * useAuth: access auth state and actions.
 * Use inside AuthProvider only.
 */
export function useAuth() {
  return useAuthContext();
}
