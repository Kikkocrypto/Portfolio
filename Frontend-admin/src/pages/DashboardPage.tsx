/**
 * Dashboard home. Protected via ProtectedRoute + AdminGuard; layout provides nav and logout.
 */
export function DashboardPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: 0 }}>
      <h1 style={{ margin: '0 0 1rem', fontSize: '1.5rem', color: 'var(--admin-text, #3d3832)' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--admin-muted, #6b6560)' }}>
        Benvenuto nell'area admin. Usa il menu per gestire messaggi di contatto, log di audit e le altre funzioni.
      </p>
    </div>
  );
}
