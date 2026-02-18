import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllPosts, deletePost, patchPostStatus } from '@/api/blogService';
import { useToastContext } from '@/context/ToastContext';
import { useLanguage, getTitleForLocale } from '@/hooks/useLanguage';
import type { ApiPost, BlogPostDisplay } from '@/types/blog';

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/** Safe display string: no HTML, length cap. React escapes on render. */
function safeText(s: unknown, maxLen: number): string {
  if (s == null) return '';
  const t = String(s);
  return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
}

function SkeletonTable() {
  return (
    <div
      className="admin-table-wrapper"
      style={{
        border: '1px solid var(--admin-border, #d4cdc0)',
        borderRadius: 8,
        background: 'var(--admin-card, #ebe6dc)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--admin-border, #d4cdc0)' }}>
            {['Titolo', 'Slug', 'Status', 'Traduzioni', 'Creato', 'Aggiornato', 'Azioni'].map((label) => (
              <th
                key={label}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem',
                  color: 'var(--admin-muted)',
                  fontWeight: 600,
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
            <tr
              key={i}
              style={{
                borderBottom: '1px solid var(--admin-border, #d4cdc0)',
              }}
            >
              {Array.from({ length: 7 }).map((_, j) => (
                <td
                  key={j}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(125, 110, 92, 0.08)',
                    borderRadius: 4,
                  }}
                >
                  <span style={{ opacity: 0 }}>—</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
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
      Nessun articolo. Aggiungi il primo post dal backend o dall’editor.
    </div>
  );
}

export function BlogListPage() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const locale = useLanguage();

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [titleSearch, setTitleSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setTitleSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchPosts = useCallback(
    async (signal?: AbortSignal, title?: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllPosts(signal, title != null ? { title } : undefined);
        setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      const msg = e instanceof Error ? e.message : 'Errore di caricamento';
      setError(msg);
      if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
        showToast(
          msg === 'UNAUTHORIZED'
            ? 'Sessione scaduta. Effettua di nuovo l\'accesso.'
            : 'Non hai i permessi per visualizzare gli articoli.',
          'error'
        );
      } else {
        showToast('Impossibile caricare gli articoli.', 'error');
      }
    } finally {
      setLoading(false);
    }
  },
    [showToast]
  );

  useEffect(() => {
    const ac = new AbortController();
    abortRef.current = ac;
    setPage(0);
    fetchPosts(ac.signal, titleSearch);
    return () => {
      ac.abort();
      abortRef.current = null;
    };
  }, [fetchPosts, titleSearch]);

  const sortedAndPaged = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    const start = page * PAGE_SIZE;
    return {
      items: list.slice(start, start + PAGE_SIZE),
      totalPages: Math.max(1, Math.ceil(list.length / PAGE_SIZE)),
      totalElements: list.length,
    };
  }, [posts, page]);

  const memoizedRows = useMemo((): BlogPostDisplay[] => {
    if (!Array.isArray(sortedAndPaged.items)) return [];
    return sortedAndPaged.items.map((p) => ({
      id: p.id ?? '',
      slug: safeText(p.slug, 80),
      createdAt: p.createdAt ?? '',
      updatedAt: p.updatedAt ?? '',
      title: safeText(getTitleForLocale(p.translations, locale), 120) || '—',
      status: p.status,
      locales: Object.keys(p.translations ?? {}).filter(Boolean).sort(),
    }));
  }, [sortedAndPaged.items, locale]);

  const empty = memoizedRows.length === 0 && !loading && !error;
  const canPrev = page > 0;
  const canNext = page < sortedAndPaged.totalPages - 1;

  const handleDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!id || deletingId) return;
      if (!window.confirm('Eliminare questo articolo e tutte le sue traduzioni? L\'operazione non si può annullare.')) return;
      setDeletingId(id);
      deletePost(id)
        .then(() => {
          showToast('Articolo eliminato.', 'success');
          setPosts((prev) => prev.filter((p) => p.id !== id));
        })
        .catch((err) => {
          if (err instanceof Error && err.name === 'AbortError') return;
          const msg = err instanceof Error ? err.message : 'Errore';
          if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
            showToast(msg === 'UNAUTHORIZED' ? 'Sessione scaduta.' : 'Non hai i permessi per eliminare.', 'error');
          } else if (msg === 'NOT_FOUND') {
            showToast('Articolo non trovato.', 'error');
            setPosts((prev) => prev.filter((p) => p.id !== id));
          } else {
            showToast('Impossibile eliminare l\'articolo.', 'error');
          }
        })
        .finally(() => setDeletingId(null));
    },
    [deletingId, showToast]
  );

  const handleRowClick = useCallback(
    (id: string) => {
      if (!id) return;
      navigate(`/admin/posts/${encodeURIComponent(id)}/edit`);
    },
    [navigate]
  );

  const handleArchive = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!id || archivingId) return;
      setArchivingId(id);
      patchPostStatus(id, { status: 'archived' })
        .then(() => {
          showToast('Articolo archiviato.', 'success');
          setPosts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: 'archived' } : p))
          );
        })
        .catch((err) => {
          if (err instanceof Error && err.name === 'AbortError') return;
          const msg = err instanceof Error ? err.message : 'Errore';
          if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
            showToast(
              msg === 'UNAUTHORIZED' ? 'Sessione scaduta.' : 'Non hai i permessi per archiviare.',
              'error'
            );
          } else if (msg === 'NOT_FOUND') {
            showToast('Articolo non trovato.', 'error');
          } else {
            showToast('Impossibile archiviare l\'articolo.', 'error');
          }
        })
        .finally(() => setArchivingId(null));
    },
    [archivingId, showToast]
  );

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      <h1
        style={{
          margin: '0 0 1rem',
          fontSize: '1.5rem',
          color: 'var(--admin-text, #3d3832)',
        }}
      >
        Articoli
      </h1>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'clamp(0.75rem, 2vw, 1rem)',
          marginBottom: '1.25rem',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.9rem',
            color: 'var(--admin-muted, #6b6560)',
          }}
        >
          Elenco articoli del blog. Clicca su una riga per modificare.
        </p>
        <label
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: 0,
          }}
        >
          <span style={{ fontSize: '0.9rem', color: 'var(--admin-muted)' }}>
            Cerca per titolo:
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Titolo..."
            aria-label="Cerca articoli per titolo"
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.9rem',
              border: '1px solid var(--admin-border, #d4cdc0)',
              borderRadius: 6,
              minWidth: 160,
              flex: '1 1 180px',
              maxWidth: '100%',
            }}
          />
        </label>
        <Link
          to="/admin/posts/new"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            background: 'var(--admin-accent, #7d6e5c)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          + Nuovo articolo
        </Link>
      </div>

      {loading && memoizedRows.length === 0 && <SkeletonTable />}

      {error && memoizedRows.length === 0 && (
        <p style={{ color: 'var(--admin-error, #8b4513)' }} role="alert">
          {error === 'UNAUTHORIZED' || error === 'FORBIDDEN'
            ? 'Accesso non autorizzato.'
            : 'Errore di caricamento.'}
        </p>
      )}

      {empty && !loading && !error && <EmptyState />}

      {memoizedRows.length > 0 && (
        <div
          className="admin-table-wrapper"
          style={{
            border: '1px solid var(--admin-border, #d4cdc0)',
            borderRadius: 8,
            background: 'var(--admin-card, #ebe6dc)',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: 700,
              borderCollapse: 'collapse',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
            }}
            role="grid"
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
                  Titolo
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    color: 'var(--admin-muted)',
                    fontWeight: 600,
                  }}
                >
                  Slug
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    color: 'var(--admin-muted)',
                    fontWeight: 600,
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    color: 'var(--admin-muted)',
                    fontWeight: 600,
                  }}
                >
                  Traduzioni
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    color: 'var(--admin-muted)',
                    fontWeight: 600,
                  }}
                >
                  Creato
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    color: 'var(--admin-muted)',
                    fontWeight: 600,
                  }}
                >
                  Aggiornato
                </th>
                <th style={{ width: 140, padding: '0.75rem', color: 'var(--admin-muted)', fontWeight: 600 }}>
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody>
              {memoizedRows.map((row) => (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleRowClick(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(row.id);
                    }
                  }}
                  style={{
                    borderBottom: '1px solid var(--admin-border, #d4cdc0)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(125, 110, 92, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '';
                  }}
                >
                  <td
                    style={{
                      padding: '0.75rem',
                      color: 'var(--admin-text)',
                      fontWeight: 500,
                    }}
                  >
                    {row.title}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem',
                      color: 'var(--admin-muted)',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                    }}
                  >
                    {row.slug || '—'}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--admin-text)' }}>
                    {row.status === 'published'
                      ? 'Pubblicato'
                      : row.status === 'draft'
                        ? 'Bozza'
                        : row.status === 'archived'
                          ? 'Archiviato'
                          : row.status || '—'}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem',
                      color: 'var(--admin-muted)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {row.locales.length > 0
                      ? row.locales.map((l) => l.toUpperCase()).join(', ')
                      : '—'}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--admin-text)' }}>
                    {formatDate(row.createdAt)}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--admin-text)' }}>
                    {formatDate(row.updatedAt)}
                  </td>
                  <td style={{ padding: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row.id);
                        }}
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.85rem',
                          background: 'var(--admin-accent, #7d6e5c)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        Modifica
                      </button>
                      {row.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={(e) => handleArchive(row.id, e)}
                          disabled={archivingId === row.id}
                          aria-label="Archivia articolo"
                          title="Archivia articolo"
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.85rem',
                            background: 'transparent',
                            color: 'var(--admin-muted, #6b6560)',
                            border: '1px solid var(--admin-border, #d4cdc0)',
                            borderRadius: 6,
                            cursor: archivingId === row.id ? 'not-allowed' : 'pointer',
                            opacity: archivingId === row.id ? 0.6 : 1,
                          }}
                        >
                          {archivingId === row.id ? '…' : 'Archivia'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(row.id, e)}
                        disabled={deletingId === row.id}
                        aria-label="Elimina articolo"
                        title="Elimina articolo"
                        style={{
                          padding: '0.35rem',
                          background: 'transparent',
                          color: 'var(--admin-error, #8b4513)',
                          border: 'none',
                          borderRadius: 6,
                          cursor: deletingId === row.id ? 'not-allowed' : 'pointer',
                          opacity: deletingId === row.id ? 0.6 : 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {deletingId === row.id ? (
                          <span style={{ fontSize: '0.85rem' }}>…</span>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && memoizedRows.length > 0 && (
        <p style={{ marginTop: '0.5rem', color: 'var(--admin-muted)' }}>
          Aggiornamento…
        </p>
      )}

      {sortedAndPaged.totalPages > 1 && (
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
            Pagina {page + 1} di {sortedAndPaged.totalPages} ({sortedAndPaged.totalElements} articoli)
          </span>
          <button
            type="button"
            disabled={!canNext || loading}
            onClick={() =>
              setPage((p) => Math.min(sortedAndPaged.totalPages - 1, p + 1))
            }
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
