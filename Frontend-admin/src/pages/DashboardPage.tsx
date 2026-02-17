/**
 * Dashboard home. Protected via ProtectedRoute + AdminGuard; layout provides nav and logout.
 */
export function DashboardPage() {
  return (
    <div
      style={{
        padding: 'clamp(1rem, 3vw, 2rem)',
        maxWidth: 800,
        margin: 0,
      }}
    >
      <h1
        style={{
          margin: '0 0 1rem',
          fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
          color: 'var(--admin-text, #3d3832)',
        }}
      >
        Dashboard
      </h1>
      <p style={{ color: 'var(--admin-muted, #6b6560)', lineHeight: 1.6 }}>
        Benvenuto nell&apos;area admin. Usa il menu per gestire messaggi di contatto, log di audit e le altre
        funzioni.
      </p>
    </div>
  );
}
