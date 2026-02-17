import { useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/context/ToastContext';
import { BACKEND_UNREACHABLE_MESSAGE } from '@/api/auth';

const MAX_FAILURES_BEFORE_DELAY = 3;
const LOCKOUT_MS = 15_000;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToastContext();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);

  const failureCountRef = useRef(0);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin';
  const passwordResetSuccess = (location.state as { passwordResetSuccess?: boolean })?.passwordResetSuccess;
  const isLockedOut = lockoutUntil > Date.now();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (isLockedOut || isSubmitting) return;

      setIsSubmitting(true);
      let result: { success: boolean; message?: string };
      try {
        result = await login(loginId.trim(), password);
      } catch {
        result = { success: false, message: BACKEND_UNREACHABLE_MESSAGE };
      }
      setIsSubmitting(false);

      if (result.success) {
        navigate(from, { replace: true });
        return;
      }

      const msg = result.message ?? 'Login failed.';
      setError(msg);

      if (msg === BACKEND_UNREACHABLE_MESSAGE) {
        showToast(msg, 'error');
        return;
      }

      failureCountRef.current += 1;
      if (failureCountRef.current >= MAX_FAILURES_BEFORE_DELAY) {
        failureCountRef.current = 0;
        const until = Date.now() + LOCKOUT_MS;
        setLockoutUntil(until);
        setError(`Too many attempts. Try again in ${LOCKOUT_MS / 1000} seconds.`);
      }
    },
    [loginId, password, login, navigate, from, isLockedOut, isSubmitting, showToast]
  );

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Admin</h1>
        <p className="login-subtitle">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label" htmlFor="login-id">
            Username or email
          </label>
          <input
            id="login-id"
            type="text"
            autoComplete="username"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            disabled={isLockedOut}
            className="login-input"
            autoFocus
          />

          <label className="login-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLockedOut}
            className="login-input"
          />

          {passwordResetSuccess && (
            <p className="login-success" role="status">
              Password aggiornata. Accedi con la nuova password.
            </p>
          )}
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isLockedOut}
            className="login-button"
          >
            {isSubmitting ? 'Signing in…' : isLockedOut ? 'Wait…' : 'Sign in'}
          </button>

          <Link to="/admin/forgot-password" className="login-link">
            Recupera password
          </Link>
        </form>
      </div>

      <style>{`
        .login-page {
          --admin-bg: #f5f0e8;
          --admin-card: #ebe6dc;
          --admin-border: #d4cdc0;
          --admin-text: #3d3832;
          --admin-muted: #6b6560;
          --admin-accent: #7d6e5c;
          --admin-error: #8b4513;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--admin-bg);
          padding: 1rem;
        }
        .login-card {
          width: 100%;
          max-width: 360px;
          padding: 2rem;
          background: var(--admin-card);
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(61, 56, 50, 0.06);
        }
        .login-title {
          margin: 0 0 0.25rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--admin-text);
        }
        .login-subtitle {
          margin: 0 0 1.5rem;
          font-size: 0.9rem;
          color: var(--admin-muted);
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .login-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--admin-text);
        }
        .login-input {
          padding: 0.6rem 0.75rem;
          font-size: 1rem;
          border: 1px solid var(--admin-border);
          border-radius: 6px;
          background: #fff;
          color: var(--admin-text);
        }
        .login-input:focus {
          outline: none;
          border-color: var(--admin-accent);
          box-shadow: 0 0 0 2px rgba(125, 110, 92, 0.2);
        }
        .login-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-error {
          margin: 0;
          font-size: 0.85rem;
          color: var(--admin-error);
        }
        .login-button {
          margin-top: 0.25rem;
          padding: 0.65rem 1rem;
          min-height: 44px;
          font-size: 1rem;
          font-weight: 500;
          color: #fff;
          background: var(--admin-accent);
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .login-button:hover:not(:disabled) {
          filter: brightness(1.05);
        }
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-link {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: var(--admin-accent);
          text-decoration: none;
        }
        .login-link:hover {
          text-decoration: underline;
        }
        .login-success {
          margin: 0;
          font-size: 0.9rem;
          color: #2d6a2d;
        }
      `}</style>
    </div>
  );
}
