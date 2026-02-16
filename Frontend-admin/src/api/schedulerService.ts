import { adminFetch } from '@/api/authClient';

function isValidIsoDate(s: unknown): s is string {
  if (typeof s !== 'string' || !s) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

/**
 * Fetches the next scheduled run of the data retention job (contacts + audit logs).
 * ADMIN only. Returns ISO string or null.
 */
export async function getDataRetentionNextRun(signal?: AbortSignal): Promise<string | null> {
  const res = await adminFetch('/scheduler/data-retention-next-run', {
    method: 'GET',
    credentials: 'include',
    signal,
  });

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 403) throw new Error('FORBIDDEN');
  if (!res.ok) return null;

  const contentType = res.headers.get('Content-Type');
  if (!contentType?.includes('application/json')) return null;

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const nextRun = (data as Record<string, unknown>).nextRun;
  if (nextRun == null) return null;
  if (!isValidIsoDate(nextRun)) return null;
  return nextRun as string;
}
