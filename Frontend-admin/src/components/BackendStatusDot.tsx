import { useState, useEffect } from 'react';
import { API_BASE } from '../api/config';

const CHECK_INTERVAL_MS = 15000;

export function BackendStatusDot() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    if (!API_BASE) {
      setOnline(null);
      return;
    }
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
        setOnline(res.ok);
      } catch {
        setOnline(false);
      }
    };
    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  if (!API_BASE) return null;
  if (online === null) return null;

  return (
    <span
      title={online ? 'Backend online' : 'Backend non raggiungibile'}
      aria-label={online ? 'Backend online' : 'Backend non raggiungibile'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          flexShrink: 0,
          background: online ? 'var(--admin-success, #22c55e)' : 'var(--admin-error, #ef4444)',
          animation: online ? 'backend-pulse 2s ease-in-out infinite' : undefined,
        }}
      />
    </span>
  );
}
