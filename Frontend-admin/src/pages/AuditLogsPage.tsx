import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getAuditLogs } from '@/api/auditLogsService';
import { useToastContext } from '@/context/ToastContext';
import type { AuditLogEntry } from '@/types/auditLogs';

const CRITICAL_ACTIONS = new Set(['DELETE', 'DELETE_MESSAGE', 'LOGIN_FAILED', 'LOGIN_FAILURE']);

function formatTimestamp(iso: string): string {
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
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

/** Safe display string: length cap, no HTML (React escapes on render). */
function safeText(s: unknown, maxLen: number): string {
  if (s == null) return '';
  const t = String(s);
  return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
}

/** Obfuscate IP/hash: show prefix only to reduce exposure. */
function obfuscateIp(ip: string): string {
  if (!ip || typeof ip !== 'string') return '—';
  const t = ip.trim();
  if (t.length <= 12) return t;
  return t.slice(0, 8) + '…';
}

function isCriticalAction(action: string): boolean {
  if (!action || typeof action !== 'string') return false;
  return CRITICAL_ACTIONS.has(action.toUpperCase());
}

export function AuditLogsPage() {
  const { showToast } = useToastContext();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterAction, setFilterAction] = useState('');
  const [filterUserEmail, setFilterUserEmail] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [applyKey, setApplyKey] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  const fetchLogs = useCallback(
    async (pageIndex: number, signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAuditLogs(
          {
            page: pageIndex,
            action: filterAction.trim() || undefined,
            userEmail: filterUserEmail.trim() || undefined,
            dateFrom: filterDateFrom.trim() || undefined,
            dateTo: filterDateTo.trim() || undefined,
          },
          signal
        );
        setLogs(data.content ?? []);
        setTotalElements(data.totalElements ?? 0);
        setTotalPages(data.totalPages ?? 0);
        setPage(data.number ?? 0);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        const msg = e instanceof Error ? e.message : 'Errore di caricamento';
        setError(msg);
        if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
          showToast(
            msg === 'UNAUTHORIZED'
              ? 'Sessione scaduta. Effettua di nuovo l\'accesso.'
              : 'Non hai i permessi per visualizzare i log.',
            'error'
          );
        } else if (msg === 'RATE_LIMIT') {
          showToast('Troppe richieste. Riprova tra poco.', 'error');
        } else {
          showToast('Impossibile caricare i log di audit.', 'error');
        }
      } finally {
        setLoading(false);
      }
    },
    [filterAction, filterUserEmail, filterDateFrom, filterDateTo, showToast]
  );

  useEffect(() => {
    const ac = new AbortController();
    abortRef.current = ac;
    fetchLogs(page, ac.signal);
    return () => {
      ac.abort();
      abortRef.current = null;
    };
  }, [page, applyKey, fetchLogs]);

  const handleApplyFilters = useCallback(() => {
    setPage(0);
    setApplyKey((k) => k + 1);
  }, []);

  const memoizedRows = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    return logs.map((entry) => ({
      id: entry.id ?? '',
      action: safeText(entry.action, 80),
      entity: safeText(entry.entity, 60),
      userEmail: safeText(entry.userEmail, 120),
      timestamp: entry.timestamp ?? '',
      ipAddress: obfuscateIp(entry.ipAddress ?? ''),
    }));
  }, [logs]);

  const empty = memoizedRows.length === 0 && !loading && !error;
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
      <h1
        style={{
          margin: '0 0 1rem',
          fontSize: '1.5rem',
          color: 'var(--admin-text, #3d3832)',
        }}
      >
        Log di audit
      </h1>
      <p
        style={{
          margin: '0 0 0.5rem',
          fontSize: '0.9rem',
          color: 'var(--admin-muted, #6b6560)',
        }}
      >
        Solo lettura. I log non possono essere modificati né eliminati da questa interfaccia.
      </p>

      {/* Filters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '0.75rem',
          alignItems: 'end',
          marginBottom: '1.25rem',
          padding: '1rem',
          background: 'var(--admin-card, #ebe6dc)',
          border: '1px solid var(--admin-border, #d4cdc0)',
          borderRadius: 8,
        }}
      >
        <div>
          <label
            htmlFor="audit-filter-action"
            style={{
              display: 'block',
              fontSize: '0.8rem',
              color: 'var(--admin-muted)',
              marginBottom: '0.25rem',
            }}
          >
            Azione
          </label>
          <input
            id="audit-filter-action"
            type="text"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            placeholder="es. LOGIN_FAILURE"
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '0.9rem',
              border: '1px solid var(--admin-border)',
              borderRadius: 6,
              background: '#fff',
            }}
          />
        </div>
        <div>
          <label
            htmlFor="audit-filter-email"
            style={{
              display: 'block',
              fontSize: '0.8rem',
              color: 'var(--admin-muted)',
              marginBottom: '0.25rem',
            }}
          >
            Utente (email)
          </label>
          <input
            id="audit-filter-email"
            type="text"
            value={filterUserEmail}
            onChange={(e) => setFilterUserEmail(e.target.value)}
            placeholder="Cerca per email"
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '0.9rem',
              border: '1px solid var(--admin-border)',
              borderRadius: 6,
              background: '#fff',
            }}
          />
        </div>
        <div>
          <label
            htmlFor="audit-filter-dateFrom"
            style={{
              display: 'block',
              fontSize: '0.8rem',
              color: 'var(--admin-muted)',
              marginBottom: '0.25rem',
            }}
          >
            Da data
          </label>
          <input
            id="audit-filter-dateFrom"
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '0.9rem',
              border: '1px solid var(--admin-border)',
              borderRadius: 6,
              background: '#fff',
            }}
          />
        </div>
        <div>
          <label
            htmlFor="audit-filter-dateTo"
            style={{
              display: 'block',
              fontSize: '0.8rem',
              color: 'var(--admin-muted)',
              marginBottom: '0.25rem',
            }}
          >
            A data
          </label>
          <input
            id="audit-filter-dateTo"
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '0.9rem',
              border: '1px solid var(--admin-border)',
              borderRadius: 6,
              background: '#fff',
            }}
          />
        </div>
        <div>
          <button
            type="button"
            onClick={handleApplyFilters}
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
            Applica filtri
          </button>
        </div>
      </div>

      {loading && memoizedRows.length === 0 && (
        <p style={{ color: 'var(--admin-muted, #6b6560)' }}>Caricamento…</p>
      )}

      {error && memoizedRows.length === 0 && (
        <p
          style={{ color: 'var(--admin-error, #8b4513)' }}
          role="alert"
        >
          {error === 'UNAUTHORIZED' || error === 'FORBIDDEN'
            ? 'Accesso non autorizzato.'
            : 'Errore di caricamento.'}
        </p>
      )}

      {empty && (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--admin-card, #ebe6dc)',
            border: '1px solid var(--admin-border, #d4cdc0)',
            borderRadius: 8,
            color: 'var(--admin-muted, #6b6560)',
          }}
        >
          Nessun log trovato.
        </div>
      )}

      {memoizedRows.length > 0 && (
        <div
          style={{
            overflowX: 'auto',
            border: '1px solid var(--admin-border, #d4cdc0)',
            borderRadius: 8,
            background: 'var(--admin-card, #ebe6dc)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
            }}
            role="grid"
            aria-readonly="true"
          >
            <thead>
              <tr style={{ borderBottom: '2px solid var(--admin-border, #d4cdc0)' }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    color: 'var(--admin-muted)',
                    fontWeight: 600,
                  }}
                >
                  Data e ora
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    color: 'var(--admin-muted)',
                    fontWeight: 600,
                  }}
                >
                  Azione
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    color: 'var(--admin-muted)',
                    fontWeight: 600,
                  }}
                >
                  Entità
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    color: 'var(--admin-muted)',
                    fontWeight: 600,
                  }}
                >
                  Utente
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    color: 'var(--admin-muted)',
                    fontWeight: 600,
                  }}
                >
                  IP
                </th>
              </tr>
            </thead>
            <tbody>
              {memoizedRows.map((row, idx) => {
                const entry = logs[idx];
                const critical = entry ? isCriticalAction(entry.action) : false;
                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid var(--admin-border, #d4cdc0)',
                      background: critical
                        ? 'rgba(139, 69, 19, 0.08)'
                        : undefined,
                    }}
                  >
                    <td
                      style={{
                        padding: '0.75rem',
                        color: 'var(--admin-text)',
                      }}
                    >
                      {formatTimestamp(row.timestamp)}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        color: critical ? 'var(--admin-error, #8b4513)' : 'var(--admin-text)',
                        fontWeight: critical ? 600 : 400,
                      }}
                    >
                      {row.action}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        color: 'var(--admin-text)',
                      }}
                    >
                      {row.entity || '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        color: 'var(--admin-text)',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        msUserSelect: 'none',
                      }}
                      tabIndex={-1}
                    >
                      {row.userEmail || '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        color: 'var(--admin-muted)',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        msUserSelect: 'none',
                      }}
                      tabIndex={-1}
                    >
                      {row.ipAddress}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.9rem',
              background: 'var(--admin-accent, #7d6e5c)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: canPrev && !loading ? 'pointer' : 'not-allowed',
              opacity: canPrev && !loading ? 1 : 0.6,
            }}
          >
            Indietro
          </button>
          <span style={{ color: 'var(--admin-muted)', fontSize: '0.9rem' }}>
            Pagina {page + 1} di {totalPages} ({totalElements} log)
          </span>
          <button
            type="button"
            disabled={!canNext || loading}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.9rem',
              background: 'var(--admin-accent, #7d6e5c)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: canNext && !loading ? 'pointer' : 'not-allowed',
              opacity: canNext && !loading ? 1 : 0.6,
            }}
          >
            Avanti
          </button>
        </div>
      )}
    </div>
  );
}
