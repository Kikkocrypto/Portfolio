import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getMessages, deleteMessage } from '@/api/messagesService';
import { useToastContext } from '@/context/ToastContext';
import type { AdminMessage } from '@/types/messages';

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, {
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

function safeText(s: unknown): string {
  if (s == null) return '';
  const t = String(s);
  return t.length > 500 ? t.slice(0, 500) + '…' : t;
}

function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function MessagesPage() {
  const { showToast } = useToastContext();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingMessage, setViewingMessage] = useState<AdminMessage | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const deleteInProgressRef = useRef(false);

  const fetchMessages = useCallback(async (pageIndex: number, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages(pageIndex, signal);
      setMessages(data.content ?? []);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
      setPage(data.number ?? 0);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      const msg = e instanceof Error ? e.message : 'Errore di caricamento';
      setError(msg);
      if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
        showToast(msg === 'UNAUTHORIZED' ? 'Sessione scaduta. Effettua di nuovo l\'accesso.' : 'Non hai i permessi per visualizzare i messaggi.', 'error');
      } else if (msg === 'RATE_LIMIT') {
        showToast('Troppe richieste. Riprova tra poco.', 'error');
      } else {
        showToast('Impossibile caricare i messaggi.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const ac = new AbortController();
    abortRef.current = ac;
    fetchMessages(page, ac.signal);
    return () => {
      ac.abort();
      abortRef.current = null;
    };
  }, [page, fetchMessages]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!id || deleteInProgressRef.current || deletingId) return;
      const confirmed = window.confirm(
        'Eliminare questo messaggio? L\'operazione non può essere annullata.'
      );
      if (!confirmed) return;

      deleteInProgressRef.current = true;
      setDeletingId(id);
      try {
        await deleteMessage(id, abortRef.current?.signal);
        showToast('Messaggio eliminato.', 'success');
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setTotalElements((prev) => Math.max(0, prev - 1));
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        const msg = e instanceof Error ? e.message : 'DELETE_FAILED';
        if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
          showToast(msg === 'UNAUTHORIZED' ? 'Sessione scaduta.' : 'Permessi insufficienti.', 'error');
        } else if (msg === 'NOT_FOUND') {
          showToast('Messaggio non trovato o già eliminato.', 'error');
          setMessages((prev) => prev.filter((m) => m.id !== id));
          setTotalElements((prev) => Math.max(0, prev - 1));
        } else {
          showToast('Eliminazione non riuscita.', 'error');
        }
      } finally {
        setDeletingId(null);
        deleteInProgressRef.current = false;
      }
    },
    [deletingId, showToast]
  );

  const memoizedList = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    return messages.map((m) => ({
      id: m.id ?? '',
      name: safeText(m.name),
      email: safeText(m.email),
      message: safeText(m.message),
      receivedAt: m.receivedAt ?? '',
    }));
  }, [messages]);

  const empty = memoizedList.length === 0 && !loading && !error;
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: 'var(--admin-text, #3d3832)' }}>
        Messaggi di contatto
      </h1>

      {loading && memoizedList.length === 0 && (
        <p style={{ color: 'var(--admin-muted, #6b6560)' }}>Caricamento…</p>
      )}

      {error && memoizedList.length === 0 && (
        <p style={{ color: 'var(--admin-error, #8b4513)' }} role="alert">
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
          Nessun messaggio presente.
        </div>
      )}

      {memoizedList.length > 0 && (
        <div
          style={{
            overflowX: 'auto',
            border: '1px solid var(--admin-border, #d4cdc0)',
            borderRadius: 8,
            background: 'var(--admin-card, #ebe6dc)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--admin-border, #d4cdc0)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--admin-muted)' }}>Data</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--admin-muted)' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--admin-muted)' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--admin-muted)' }}>Messaggio</th>
                <th style={{ width: 120, padding: '0.75rem', color: 'var(--admin-muted)' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {memoizedList.map((m) => (
                <tr
                  key={m.id}
                  style={{ borderBottom: '1px solid var(--admin-border, #d4cdc0)' }}
                >
                  <td style={{ padding: '0.75rem', color: 'var(--admin-text)' }}>
                    {formatDate(m.receivedAt)}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--admin-text)' }}>
                    {m.name}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--admin-text)' }}>
                    {m.email}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--admin-text)', maxWidth: 280 }}>
                    {m.message}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const full = messages.find((x) => x.id === m.id);
                          if (full) setViewingMessage(full);
                        }}
                        style={{
                          padding: '0.35rem',
                          background: 'transparent',
                          color: 'var(--admin-accent, #7d6e5c)',
                          border: '1px solid var(--admin-border)',
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label="Visualizza messaggio"
                      >
                        <EyeIcon size={18} />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId !== null}
                        onClick={() => handleDelete(m.id)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.8rem',
                          background: deletingId === m.id ? 'var(--admin-muted)' : 'transparent',
                          color: 'var(--admin-error, #8b4513)',
                          border: '1px solid var(--admin-border)',
                          borderRadius: 4,
                          cursor: deletingId !== null ? 'not-allowed' : 'pointer',
                          opacity: deletingId === m.id ? 0.8 : 1,
                        }}
                        aria-label="Elimina messaggio"
                      >
                        {deletingId === m.id ? '…' : 'Elimina'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewingMessage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-message-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
            padding: '1rem',
          }}
          onClick={() => setViewingMessage(null)}
        >
          <div
            style={{
              background: 'var(--admin-card, #ebe6dc)',
              border: '1px solid var(--admin-border, #d4cdc0)',
              borderRadius: 8,
              maxWidth: 480,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--admin-border)' }}>
              <h2 id="view-message-title" style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--admin-text)' }}>
                Dettaglio messaggio
              </h2>
              <dl style={{ margin: 0, display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                <div>
                  <dt style={{ margin: 0, color: 'var(--admin-muted)', fontWeight: 600 }}>Data</dt>
                  <dd style={{ margin: '0.2rem 0 0', color: 'var(--admin-text)' }}>{formatDate(viewingMessage.receivedAt)}</dd>
                </div>
                <div>
                  <dt style={{ margin: 0, color: 'var(--admin-muted)', fontWeight: 600 }}>Nome</dt>
                  <dd style={{ margin: '0.2rem 0 0', color: 'var(--admin-text)' }}>{safeText(viewingMessage.name)}</dd>
                </div>
                <div>
                  <dt style={{ margin: 0, color: 'var(--admin-muted)', fontWeight: 600 }}>Email</dt>
                  <dd style={{ margin: '0.2rem 0 0', color: 'var(--admin-text)' }}>{safeText(viewingMessage.email)}</dd>
                </div>
                <div>
                  <dt style={{ margin: 0, color: 'var(--admin-muted)', fontWeight: 600 }}>Messaggio</dt>
                  <dd style={{ margin: '0.2rem 0 0', color: 'var(--admin-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {safeText(viewingMessage.message)}
                  </dd>
                </div>
              </dl>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setViewingMessage(null)}
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
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
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
            Pagina {page + 1} di {totalPages} ({totalElements} messaggi)
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
