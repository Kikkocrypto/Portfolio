import { useEffect, useState } from 'react';
import { getDataRetentionNextRun } from '@/api/schedulerService';

function formatNextRun(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

/**
 * Mostra la prossima esecuzione programmata del job di data retention (messaggi + audit log).
 * Si aggiorna a ogni caricamento della pagina; il backend aggiorna il valore a ogni run del cron.
 */
export function DataRetentionNextRun() {
  const [nextRun, setNextRun] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDataRetentionNextRun()
      .then((value) => {
        if (!cancelled) setNextRun(value);
      })
      .catch(() => {
        if (!cancelled) setNextRun(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--admin-muted, #6b6560)' }}>
        Prossima esecuzione data retention: …
      </p>
    );
  }

  return (
    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--admin-muted, #6b6560)' }}>
      Prossima esecuzione data retention: <strong style={{ color: 'var(--admin-text, #3d3832)' }}>{formatNextRun(nextRun)}</strong>
    </p>
  );
}
