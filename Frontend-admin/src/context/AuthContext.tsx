import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '@/api/auth';
import { setAuthCallbacks } from '@/api/authClient';
import type { AdminUser, AuthState } from '@/types/auth';
import { ROLE_ADMIN } from '@/types/auth';

const SESSION_KEY = 'admin_session';

/** In-memory + sessionStorage (solo per la tab corrente: refresh ok, chiudi tab = logout). */
let memoryToken: string | null = null;
let memoryUser: AdminUser | null = null;

function getStoredToken(): string | null {
  return memoryToken;
}

function setStoredAuth(token: string | null, user: AdminUser | null): void {
  memoryToken = token;
  memoryUser = user;
  try {
    if (token && user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // sessionStorage non disponibile (es. modalità privata)
  }
}

function clearStoredAuth(): void {
  memoryToken = null;
  memoryUser = null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

function restoreFromSession(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { token, user } = JSON.parse(raw) as { token: string; user: AdminUser };
    if (token && user?.username) {
      memoryToken = token;
      memoryUser = user;
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

interface AuthContextValue extends AuthState {
  login: (login: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setUnauthorized: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const INITIAL_STATE: AuthState = {
  user: null,
  token: null,
  roles: [],
  isAuthenticated: false,
  isVerifying: true,
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const getTokenRef = useRef<() => string | null>(() => memoryToken);

  useEffect(() => {
    getTokenRef.current = () => memoryToken;
  });

  const setUnauthorized = useCallback(() => {
    clearStoredAuth();
    setState({
      user: null,
      token: null,
      roles: [],
      isAuthenticated: false,
      isVerifying: false,
    });
  }, []);

  useEffect(() => {
    setAuthCallbacks(() => getTokenRef.current(), setUnauthorized);
  }, [setUnauthorized]);

  const verifyToken = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setState((s) => ({ ...s, isVerifying: false }));
      return;
    }
    const valid = await authApi.validateToken(() => getTokenRef.current());
    if (!valid) {
      clearStoredAuth();
      setState({ ...INITIAL_STATE, isVerifying: false });
      return;
    }
    setState({
      user: memoryUser,
      token,
      roles: memoryUser ? [ROLE_ADMIN] : [],
      isAuthenticated: true,
      isVerifying: false,
    });
  }, []);

  useEffect(() => {
    restoreFromSession();
    const token = getStoredToken();
    const user = memoryUser;
    if (token && user) {
      verifyToken();
    } else {
      setState((s) => ({ ...s, isVerifying: false }));
    }
  }, [verifyToken]);

  const login = useCallback(
    async (loginId: string, password: string): Promise<{ success: boolean; message?: string }> => {
      const result = await authApi.login({ login: loginId, password });
      if (result.success) {
        setStoredAuth(result.token, result.user);
        setState({
          user: result.user,
          token: result.token,
          roles: [ROLE_ADMIN],
          isAuthenticated: true,
          isVerifying: false,
        });
        return { success: true };
      }
      return {
        success: false,
        message: (result as { message?: string }).message ?? 'Login failed.',
      };
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout(() => getTokenRef.current());
    clearStoredAuth();
    setState({ ...INITIAL_STATE, isVerifying: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      setUnauthorized,
    }),
    [state, login, logout, setUnauthorized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
