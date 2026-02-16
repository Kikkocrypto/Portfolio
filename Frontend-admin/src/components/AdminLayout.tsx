import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Layout for admin area: nav links + outlet for child routes.
 */
export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const base = '/admin';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--admin-bg, #f5f0e8)' }}>
      <header
        style={{
          borderBottom: '1px solid var(--admin-border, #d4cdc0)',
          background: 'var(--admin-card, #ebe6dc)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to={base}
            style={{
              color: location.pathname === base ? 'var(--admin-accent, #7d6e5c)' : 'var(--admin-text, #3d3832)',
              textDecoration: 'none',
              fontWeight: location.pathname === base ? 600 : 400,
            }}
          >
            Dashboard
          </Link>
          <Link
            to={`${base}/messages`}
            style={{
              color: location.pathname === `${base}/messages` ? 'var(--admin-accent, #7d6e5c)' : 'var(--admin-text, #3d3832)',
              textDecoration: 'none',
              fontWeight: location.pathname === `${base}/messages` ? 600 : 400,
            }}
          >
            Messaggi
          </Link>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--admin-muted, #6b6560)' }}>
            {user?.username ?? ''}
          </span>
          <button
            type="button"
            onClick={() => logout()}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              background: 'var(--admin-accent, #7d6e5c)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
