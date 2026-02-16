import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protects routes: no rendering until auth is resolved.
 * - While verifying: render nothing (no flicker).
 * - Not authenticated: redirect to /admin/login with return URL.
 * - Authenticated: render children.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isVerifying, isAuthenticated } = useAuth();

  if (isVerifying) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--admin-bg, #f5f0e8)',
        }}
        aria-busy="true"
        aria-label="Checking authentication"
      >
        <div style={{ width: 32, height: 32, border: '3px solid var(--admin-muted)', borderTopColor: 'var(--admin-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}
