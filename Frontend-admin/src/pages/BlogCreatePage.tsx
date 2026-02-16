import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { createPost } from '@/api/blogService';
import { useToastContext } from '@/context/ToastContext';
import { getTinyMCEConfig } from '@/config/tinymce';
import { sanitizeHtml } from '@/utils/sanitize';
import {
  validateSlug,
  validateLocale,
  trimTitle,
  trimContent,
  findDuplicateLocales,
  slugify,
  MAX_CONTENT_LEN,
} from '@/utils/validation';
import type { ApiPostCreatePayload } from '@/types/blog';

interface TranslationRow {
  id: string;
  locale: string;
  slug: string;
  title: string;
  content: string;
}

const TINYMCE_SCRIPT_SRC = '/tinymce/tinymce.min.js';

const INITIAL_TRANSLATION: TranslationRow = {
  id: '',
  locale: 'it',
  slug: '',
  title: '',
  content: '',
};

function rowToCreateItem(row: TranslationRow): ApiPostCreatePayload['translations'][0] {
  return {
    locale: row.locale.trim().toLowerCase(),
    slug: row.slug.trim() || undefined,
    title: trimTitle(row.title),
    content: sanitizeHtml(trimContent(row.content)),
  };
}

export function BlogCreatePage() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();

  const [status, setStatus] = useState<string>('draft');
  const [translations, setTranslations] = useState<TranslationRow[]>([{ ...INITIAL_TRANSLATION }]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const updateTranslation = useCallback((index: number, patch: Partial<TranslationRow>) => {
    setTranslations((prev) => {
      const next = [...prev];
      if (index < 0 || index >= next.length) return prev;
      next[index] = { ...next[index], ...patch };
      return next;
    });
    setDirty(true);
  }, []);

  const addTranslation = useCallback(() => {
    setTranslations((prev) => [...prev, { id: '', locale: '', slug: '', title: '', content: '' }]);
    setActiveTabIndex(translations.length);
    setDirty(true);
  }, [translations.length]);

  const removeTranslation = useCallback((index: number) => {
    if (translations.length <= 1) return;
    setTranslations((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
    setActiveTabIndex((prev) => {
      if (prev === index) return 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  }, [translations.length]);

  const setActiveTab = useCallback((index: number) => {
    setActiveTabIndex(Math.max(0, Math.min(index, translations.length - 1)));
  }, [translations.length]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    translations.forEach((t, i) => {
      const slugRes = validateSlug(t.slug);
      if (t.slug.trim() && !slugRes.valid && slugRes.error) {
        errors.push(`Slug (${t.locale || i + 1}): ${slugRes.error}`);
      }
    });
    const locales = translations.map((t) => t.locale.trim().toLowerCase()).filter(Boolean);
    const dups = findDuplicateLocales(locales);
    if (dups.length) errors.push(`Lingue duplicate: ${dups.join(', ')}`);
    translations.forEach((t, i) => {
      const lr = validateLocale(t.locale);
      if (!lr.valid && lr.error) errors.push(`Traduzione ${i + 1}: ${lr.error}`);
    });
    return errors;
  }, [translations]);

  const firstSlugValid = useMemo(() => {
    const first = translations[0]?.slug?.trim() ?? '';
    if (!first) return false; // create richiede almeno uno slug
    return validateSlug(first).valid;
  }, [translations]);

  const canSave =
    !saving &&
    validationErrors.length === 0 &&
    translations.length > 0 &&
    firstSlugValid &&
    translations.every(
      (t) =>
        t.locale.trim() &&
        trimTitle(t.title).length > 0 &&
        sanitizeHtml(trimContent(t.content)).length <= MAX_CONTENT_LEN
    );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;
      setSaving(true);
      try {
        const mainSlug = translations[0]?.slug?.trim() ?? '';
        const payload: ApiPostCreatePayload = {
          slug: validateSlug(mainSlug).normalized ?? mainSlug.toLowerCase(),
          status: status.trim() || undefined,
          translations: translations.map(rowToCreateItem),
        };
        const result = await createPost(payload);
        setDirty(false);
        if (result.conflict) {
          showToast(
            'Articolo creato ma con conflitto (es. una traduzione non salvata). Apri la modifica per verificare.',
            'info'
          );
        } else {
          showToast('Articolo creato.', 'success');
        }
        navigate('/admin/posts', { replace: true });
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        const msg = e instanceof Error ? e.message : 'Errore';
        if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
          showToast(
            msg === 'UNAUTHORIZED'
              ? 'Sessione scaduta.'
              : 'Non hai i permessi per creare articoli.',
            'error'
          );
        } else if (msg === 'CONFLICT') {
          showToast(
            'Conflitto (409). Se l\'articolo è stato creato comunque, cercalo nell\'elenco e aprilo in modifica per aggiungere le traduzioni.',
            'error'
          );
        } else {
          showToast('Impossibile creare l\'articolo.', 'error');
        }
      } finally {
        setSaving(false);
      }
    },
    [canSave, status, translations, showToast, navigate]
  );

  const tinymceInit = useMemo(() => getTinyMCEConfig(), []);

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 900, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (dirty && !window.confirm('Hai modifiche non salvate. Uscire senza salvare?')) return;
            navigate('/admin/posts');
          }}
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.9rem',
            background: 'transparent',
            color: 'var(--admin-accent, #7d6e5c)',
            border: '1px solid var(--admin-border, #d4cdc0)',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          ← Articoli
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: '1.35rem',
            color: 'var(--admin-text, #3d3832)',
          }}
        >
          Nuovo articolo
        </h1>
        {dirty && (
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--admin-muted, #6b6560)',
            }}
          >
            Modifiche non salvate
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: 'var(--admin-card, #ebe6dc)',
            border: '1px solid var(--admin-border, #d4cdc0)',
            borderRadius: 8,
            padding: '1.25rem',
            marginBottom: '1rem',
          }}
        >
          <label
            htmlFor="create-status"
            style={{
              display: 'block',
              marginBottom: '0.35rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--admin-text)',
            }}
          >
            Status
          </label>
          <select
            id="create-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setDirty(true);
            }}
            disabled={saving}
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.95rem',
              border: '1px solid var(--admin-border, #d4cdc0)',
              borderRadius: 6,
              background: '#fff',
              color: 'var(--admin-text)',
              minWidth: 140,
            }}
          >
            <option value="draft">Bozza</option>
            <option value="published">Pubblicato</option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35rem',
            marginBottom: '1rem',
            alignItems: 'center',
          }}
        >
          {translations.map((row, index) => {
            const isActive = index === activeTabIndex;
            const label = row.locale ? row.locale.toUpperCase() : '?';
            return (
              <button
                key={`tab-${index}`}
                type="button"
                onClick={() => setActiveTab(index)}
                aria-pressed={isActive}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? 'var(--admin-accent, #7d6e5c)' : 'var(--admin-card, #ebe6dc)',
                  color: isActive ? '#fff' : 'var(--admin-text, #3d3832)',
                  border: `1px solid ${isActive ? 'var(--admin-accent, #7d6e5c)' : 'var(--admin-border, #d4cdc0)'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={addTranslation}
            disabled={saving}
            style={{
              padding: '0.4rem 0.6rem',
              fontSize: '0.85rem',
              background: 'transparent',
              color: 'var(--admin-accent, #7d6e5c)',
              border: '1px dashed var(--admin-border, #d4cdc0)',
              borderRadius: 6,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            + Lingua
          </button>
        </div>

        {translations[activeTabIndex] && (() => {
          const index = activeTabIndex;
          const row = translations[index];
          return (
            <div
              key={`panel-${index}`}
              style={{
                background: 'var(--admin-card, #ebe6dc)',
                border: '1px solid var(--admin-border, #d4cdc0)',
                borderRadius: 8,
                padding: '1.25rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor={`tr-locale-${index}`}
                  style={{
                    display: 'block',
                    marginBottom: '0.35rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--admin-text)',
                  }}
                >
                  Codice lingua (es. it, en)
                </label>
                <input
                  id={`tr-locale-${index}`}
                  type="text"
                  value={row.locale}
                  onChange={(e) => updateTranslation(index, { locale: e.target.value })}
                  disabled={saving}
                  placeholder="it"
                  autoComplete="off"
                  style={{
                    width: '100%',
                    maxWidth: 120,
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.95rem',
                    border: '1px solid var(--admin-border, #d4cdc0)',
                    borderRadius: 6,
                    background: '#fff',
                    color: 'var(--admin-text)',
                  }}
                />
                {validateLocale(row.locale).error && (
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--admin-error, #8b4513)' }}>
                    {validateLocale(row.locale).error}
                  </p>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor={`tr-slug-${index}`}
                  style={{
                    display: 'block',
                    marginBottom: '0.35rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--admin-text)',
                  }}
                >
                  Slug (per questa lingua)
                </label>
                <input
                  id={`tr-slug-${index}`}
                  type="text"
                  value={row.slug}
                  onChange={(e) => updateTranslation(index, { slug: e.target.value })}
                  disabled={saving}
                  placeholder="es. mio-articolo"
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.95rem',
                    border: '1px solid var(--admin-border, #d4cdc0)',
                    borderRadius: 6,
                    background: '#fff',
                    color: 'var(--admin-text)',
                  }}
                />
                {validateSlug(row.slug).error && row.slug.trim() && (
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--admin-error, #8b4513)' }}>
                    {validateSlug(row.slug).error}
                  </p>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor={`tr-title-${index}`}
                  style={{
                    display: 'block',
                    marginBottom: '0.35rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--admin-text)',
                  }}
                >
                  Titolo
                </label>
                <input
                  id={`tr-title-${index}`}
                  type="text"
                  value={row.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    updateTranslation(index, { title, slug: slugify(title) });
                  }}
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.95rem',
                    border: '1px solid var(--admin-border, #d4cdc0)',
                    borderRadius: 6,
                    background: '#fff',
                    color: 'var(--admin-text)',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor={`tr-content-${index}`}
                  style={{
                    display: 'block',
                    marginBottom: '0.35rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--admin-text)',
                  }}
                >
                  Contenuto
                </label>
                <Editor
                  id={`tinymce-create-${index}`}
                  value={sanitizeHtml(row.content)}
                  onEditorChange={(content) => {
                    const sanitized = sanitizeHtml(trimContent(content));
                    updateTranslation(index, { content: sanitized });
                  }}
                  init={tinymceInit as unknown as Record<string, unknown>}
                  tinymceScriptSrc={TINYMCE_SCRIPT_SRC}
                  disabled={saving}
                />
              </div>
              {translations.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Eliminare questa traduzione?')) {
                      removeTranslation(index);
                    }
                  }}
                  disabled={saving}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.9rem',
                    background: 'transparent',
                    color: 'var(--admin-error, #8b4513)',
                    border: '1px solid var(--admin-border, #d4cdc0)',
                    borderRadius: 6,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  Elimina traduzione
                </button>
              )}
            </div>
          );
        })()}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {validationErrors.length > 0 && (
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.25rem',
                fontSize: '0.9rem',
                color: 'var(--admin-error, #8b4513)',
              }}
            >
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--admin-border, #d4cdc0)',
          }}
        >
          <button
            type="submit"
            disabled={!canSave}
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: '1rem',
              background: canSave ? 'var(--admin-accent, #7d6e5c)' : 'var(--admin-muted, #6b6560)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: canSave && !saving ? 'pointer' : 'not-allowed',
              opacity: saving ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {saving ? 'Creazione…' : 'Crea articolo'}
          </button>
        </div>
      </form>
    </div>
  );
}
