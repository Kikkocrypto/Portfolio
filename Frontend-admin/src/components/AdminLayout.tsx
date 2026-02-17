import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const SIDEBAR_WIDTH = 220;
const MOBILE_BREAKPOINT = 1024;

/**
 * Layout for admin area: collapsible sidebar on mobile/tablet, fixed sidebar on desktop.
 */
export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const base = '/admin';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', checkMobile);
    checkMobile();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const closeSidebar = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const linkStyle = (path: string) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    minHeight: '44px',
    color: location.pathname === path ? 'var(--admin-accent, #7d6e5c)' : 'var(--admin-text, #3d3832)',
    textDecoration: 'none',
    fontWeight: location.pathname === path ? 600 : 400,
    borderRadius: 6,
    background: location.pathname === path ? 'rgba(125, 110, 92, 0.12)' : 'transparent',
    transition: 'background 0.2s, color 0.2s',
  });

  const navLinks = [
    { to: base, label: 'Dashboard' },
    { to: `${base}/messages`, label: 'Messaggi' },
    { to: `${base}/audit-logs`, label: 'Log di audit' },
    { to: `${base}/posts`, label: 'Articoli' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--admin-bg, #f5f0e8)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {/* Mobile header with hamburger */}
      {isMobile && (
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            background: 'var(--admin-card, #ebe6dc)',
            borderBottom: '1px solid var(--admin-border, #d4cdc0)',
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={sidebarOpen}
            style={{
              padding: '0.5rem',
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--admin-border)',
              borderRadius: 6,
              cursor: 'pointer',
              color: 'var(--admin-text)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {sidebarOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
          <Link
            to={base}
            onClick={closeSidebar}
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--admin-text, #3d3832)',
              textDecoration: 'none',
            }}
          >
            Admin
          </Link>
          <div style={{ width: 44 }} />
        </header>
      )}

      {/* Sidebar overlay (mobile) */}
      {isMobile && sidebarOpen && (
        <div
          role="presentation"
          aria-hidden
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(0,0,0,0.4)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: isMobile ? 'fixed' : 'sticky',
          top: isMobile ? 0 : 0,
          left: 0,
          zIndex: 45,
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          height: isMobile ? '100vh' : '100vh',
          maxHeight: '100vh',
          background: 'var(--admin-card, #ebe6dc)',
          borderRight: '1px solid var(--admin-border, #d4cdc0)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflowY: 'auto',
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.25s ease-out',
          boxShadow: isMobile && sidebarOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none',
        }}
        aria-hidden={isMobile && !sidebarOpen}
      >
        {!isMobile && (
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
        )}
        <nav style={{ flex: 1, padding: '0.75rem 0' }}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={closeSidebar}
              style={{ ...linkStyle(to), margin: '0 0.5rem' }}
            >
              {label}
            </Link>
          ))}
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
            className="admin-button-primary"
            style={{
              padding: '0.6rem 1rem',
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

      <main className="admin-main" style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
