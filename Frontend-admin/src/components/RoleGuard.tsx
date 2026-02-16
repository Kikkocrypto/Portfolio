import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_ADMIN } from '@/types/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  /** Required role (e.g. ROLE_ADMIN). User must have this role. */
  requiredRole: string;
}

/**
 * Role-based guard: renders children only if user has required role.
 * Use inside ProtectedRoute so user is already authenticated.
 * Prevents role manipulation: role comes from backend (JWT/server), not from client storage.
 */
export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const location = useLocation();
  const { isVerifying, isAuthenticated, roles } = useAuth();

  if (isVerifying) return null;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const hasRole = roles.includes(requiredRole);

  if (!hasRole) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location, reason: 'forbidden' }}
        replace
      />
    );
  }

  return <>{children}</>;
}

/** Convenience wrapper for admin-only content. */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard requiredRole={ROLE_ADMIN}>{children}</RoleGuard>;
}
