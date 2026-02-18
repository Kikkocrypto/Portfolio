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

  if (API_BASE == null || API_BASE === '') return null;
  if (online === null) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={online ? 'Backend online' : 'Backend non raggiungibile'}
      aria-label={online ? 'Backend online' : 'Backend non raggiungibile'}
    >
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${
          online
            ? 'bg-emerald-500 animate-pulse'
            : 'bg-red-500'
        }`}
      />
    </span>
  );
}
