import { useAuth } from '@/hooks/useAuth';

/**
 * Example protected admin page. Wrap with ProtectedRoute + AdminGuard in router.
 */
export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--admin-text, #3d3832)' }}>
          Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--admin-muted, #6b6560)' }}>
            {user?.username}
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
      </div>
      <p style={{ color: 'var(--admin-muted, #6b6560)' }}>
        Admin area. Add your admin panels here (messages, posts, audit log).
      </p>
    </div>
  );
}
