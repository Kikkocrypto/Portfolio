import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordResetEmail } from '@/api/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await requestPasswordResetEmail(email.trim());
    setIsSubmitting(false);

    if (result.success) {
      setSent(true);
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
    .login-link {
      margin-top: 0.5rem;
      font-size: 0.9rem;
      color: var(--admin-accent);
      text-decoration: none;
    }
    .login-link:hover { text-decoration: underline; }
    .login-success { margin: 0; font-size: 0.9rem; color: var(--admin-text); }
  `;

  if (sent) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Email inviata</h1>
          <p className="login-subtitle">
            Se l&apos;indirizzo è registrato, riceverai un link per reimpostare la password. Controlla la posta e la cartella spam.
          </p>
          <Link to="/admin/login" className="login-link">
            ← Torna al login
          </Link>
        </div>
        <style>{sharedStyles}</style>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Recupero password</h1>
        <p className="login-subtitle">Inserisci l&apos;email dell&apos;account admin. Ti invieremo un link per reimpostare la password.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label" htmlFor="forgot-email">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="login-input"
            placeholder="admin@example.com"
            required
            autoFocus
          />

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className="login-button">
            {isSubmitting ? 'Invio in corso…' : 'Invia link'}
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
