import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const SIDEBAR_WIDTH = 220;

/**
 * Layout for admin area: sidebar nav + main content.
 */
export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const base = '/admin';

  const linkStyle = (path: string) => ({
    display: 'block',
    padding: '0.65rem 1rem',
    color: location.pathname === path ? 'var(--admin-accent, #7d6e5c)' : 'var(--admin-text, #3d3832)',
    textDecoration: 'none',
    fontWeight: location.pathname === path ? 600 : 400,
    borderRadius: 6,
    background: location.pathname === path ? 'rgba(125, 110, 92, 0.12)' : 'transparent',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--admin-bg, #f5f0e8)', display: 'flex' }}>
      <aside
        style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          background: 'var(--admin-card, #ebe6dc)',
          borderRight: '1px solid var(--admin-border, #d4cdc0)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: '1.25rem 1rem',
            borderBottom: '1px solid var(--admin-border, #d4cdc0)',
          }}
        >
          <Link
            to={base}
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--admin-text, #3d3832)',
              textDecoration: 'none',
            }}
          >
            Admin
          </Link>
        </div>
        <nav style={{ flex: 1, padding: '0.75rem 0' }}>
          <Link to={base} style={{ ...linkStyle(base), margin: '0 0.5rem' }}>
            Dashboard
          </Link>
          <Link to={`${base}/messages`} style={{ ...linkStyle(`${base}/messages`), margin: '0 0.5rem' }}>
            Messaggi
          </Link>
          <Link to={`${base}/audit-logs`} style={{ ...linkStyle(`${base}/audit-logs`), margin: '0 0.5rem' }}>
            Log di audit
          </Link>
        </nav>
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--admin-border, #d4cdc0)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--admin-muted, #6b6560)' }}>
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
              width: '100%',
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
