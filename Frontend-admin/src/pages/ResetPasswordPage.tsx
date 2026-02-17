import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPasswordReset } from '@/api/auth';

const PASSWORD_HINT =
  'Almeno 8 caratteri, con lettere, numeri e un simbolo (es. # . - _ @ $ !)';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token.trim()) {
      setError('Link non valido: manca il token. Richiedi un nuovo link di recupero.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token.trim() || isSubmitting) return;

    if (newPassword !== confirm) {
      setError('Le due password non coincidono.');
      return;
    }

    if (newPassword.length < 8) {
      setError(PASSWORD_HINT);
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasDigit = /\d/.test(newPassword);
    const hasSymbol = /[^a-zA-Z0-9]/.test(newPassword);
    if (!hasLetter || !hasDigit || !hasSymbol) {
      setError(PASSWORD_HINT);
      return;
    }

    setIsSubmitting(true);
    const result = await confirmPasswordReset(token.trim(), newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/admin/login', { replace: true, state: { passwordResetSuccess: true } }), 3000);
    } else {
      setError(result.message);
    }
  };

  const sharedStyles = `
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
    .login-title { margin: 0 0 0.25rem; font-size: 1.5rem; font-weight: 600; color: var(--admin-text); }
    .login-subtitle { margin: 0 0 1.5rem; font-size: 0.9rem; color: var(--admin-muted); }
    .login-form { display: flex; flex-direction: column; gap: 1rem; }
    .login-label { font-size: 0.85rem; font-weight: 500; color: var(--admin-text); }
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
    .login-error { margin: 0; font-size: 0.85rem; color: var(--admin-error); }
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
    .login-button:hover:not(:disabled) { filter: brightness(1.05); }
    .login-button:disabled { opacity: 0.7; cursor: not-allowed; }
    .login-link { margin-top: 0.5rem; font-size: 0.9rem; color: var(--admin-accent); text-decoration: none; }
    .login-link:hover { text-decoration: underline; }
    .login-success { margin: 0; font-size: 0.9rem; color: var(--admin-text); }
  `;

  if (success) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Password aggiornata</h1>
          <p className="login-subtitle">
            La password è stata reimpostata. Verrai reindirizzato al login.
          </p>
          <Link to="/admin/login" className="login-link">
            Vai al login →
          </Link>
        </div>
        <style>{sharedStyles}</style>
      </div>
    );
  }

  if (!token.trim()) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Link non valido</h1>
          <p className="login-subtitle">
            Manca il token di reset. Richiedi un nuovo link dalla pagina di recupero password.
          </p>
          <Link to="/admin/forgot-password" className="login-link">
            Recupero password →
          </Link>
        </div>
        <style>{sharedStyles}</style>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Nuova password</h1>
        <p className="login-subtitle">
          Inserisci la nuova password. Deve contenere almeno 8 caratteri, lettere, numeri e un simbolo.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label" htmlFor="new-password">
            Nuova password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSubmitting}
            className="login-input"
            required
            minLength={8}
            autoFocus
          />

          <label className="login-label" htmlFor="confirm-password">
            Conferma password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={isSubmitting}
            className="login-input"
            required
            minLength={8}
          />

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className="login-button">
            {isSubmitting ? 'Salvataggio…' : 'Imposta password'}
          </button>

          <Link to="/admin/login" className="login-link">
            ← Torna al login
          </Link>
        </form>
      </div>
      <style>{sharedStyles}</style>
    </div>
  );
}
