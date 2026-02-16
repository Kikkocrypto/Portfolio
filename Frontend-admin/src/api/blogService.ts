import { adminFetch } from '@/api/authClient';
import type {
  ApiPost,
  ApiPostById,
  ApiPostCreatePayload,
  ApiPostUpdatePayload,
  PostTranslation,
  PostTranslationItem,
} from '@/types/blog';

const MAX_TITLE_LEN = 200;
const MAX_SLUG_LEN = 255;

// Funzione per verificare se la stringa non è vuota
function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}
// Funzione per verificare se la stringa è valida
function safeStr(v: unknown, maxLen: number): string {
  if (v == null) return '';
  const s = String(v);
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}
// Funzione per verificare se la traduzione è valida
function isTranslationBlock(v: unknown): v is PostTranslation {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.title === 'string' && typeof o.content === 'string';
}
/** Backend può inviare translations come Record<locale, {title,content}> o come array [{locale, title, content}]. */
function isTranslationItem(v: unknown): v is Record<string, unknown> {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.locale === 'string' && typeof o.title === 'string' && typeof o.content === 'string';
}

function isApiPost(raw: unknown): raw is Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.slug !== 'string') return false;
  if (typeof o.createdAt !== 'string') return false;
  return true;
}

function parseTranslations(translations: unknown): Record<string, PostTranslation> {
  const out: Record<string, PostTranslation> = {};
  if (Array.isArray(translations)) {
    for (const item of translations) {
      if (isTranslationItem(item)) {
        const locale = String(item.locale ?? '').trim().toLowerCase();
        if (locale) {
          out[locale] = {
            title: safeStr(item.title, MAX_TITLE_LEN),
            content: String(item.content ?? ''),
          };
        }
      }
    }
    return out;
  }
  if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
    for (const [lang, block] of Object.entries(translations)) {
      if (isNonEmptyString(lang) && isTranslationBlock(block)) {
        out[lang] = {
          title: safeStr(block.title, MAX_TITLE_LEN),
          content: String(block.content ?? ''),
        };
      }
    }
  }
  return out;
}

function parseApiPost(raw: unknown): ApiPost {
  if (!isApiPost(raw)) throw new Error('INVALID_RESPONSE');
  const o = raw as Record<string, unknown>;
  const translations = parseTranslations(o.translations);
  return {
    id: String(o.id ?? ''),
    slug: safeStr(o.slug, MAX_SLUG_LEN),
    createdAt: String(o.createdAt ?? ''),
    updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : String(o.createdAt ?? ''),
    status: typeof o.status === 'string' ? o.status : undefined,
    translations,
  };
}

export interface GetAllPostsParams {
  /** Filtra per titolo (contiene, case-insensitive) in una qualsiasi traduzione */
  title?: string;
}

/**
 * Fetches blog posts. ADMIN only. Ordinamento: prima published, poi per data. Opzionale ricerca per titolo.
 * Caller should pass AbortSignal and handle UNAUTHORIZED/FORBIDDEN.
 */
export async function getAllPosts(
  signal?: AbortSignal,
  params?: GetAllPostsParams
): Promise<ApiPost[]> {
  const search = new URLSearchParams();
  if (params?.title != null && params.title.trim() !== '') {
    search.set('title', params.title.trim());
  }
  const qs = search.toString();
  const url = qs ? `/posts?${qs}` : '/posts';
  const res = await adminFetch(url, {
    method: 'GET',
    credentials: 'include',
    signal,
  });

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 403) throw new Error('FORBIDDEN');
  if (!res.ok) throw new Error('FETCH_FAILED');

  const contentType = res.headers.get('Content-Type');
  if (!contentType?.includes('application/json')) throw new Error('INVALID_RESPONSE');

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error('INVALID_JSON');
  }

  let items: unknown[];
  if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as Record<string, unknown>).content)) {
    items = (data as Record<string, unknown>).content as unknown[];
  } else {
    throw new Error('INVALID_RESPONSE');
  }

  return items.map((item: unknown) => parseApiPost(item));
}

function isPostTranslationItem(v: unknown): v is Record<string, unknown> {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.locale === 'string' &&
    typeof o.title === 'string' &&
    typeof o.content === 'string'
  );
}

function parsePostTranslationItem(raw: unknown): PostTranslationItem {
  if (!isPostTranslationItem(raw)) throw new Error('INVALID_RESPONSE');
  const o = raw as Record<string, unknown>;
  return {
    id: typeof o.id === 'string' ? o.id : '',
    postId: typeof o.postId === 'string' ? o.postId : '',
    locale: String(o.locale ?? '').trim().toLowerCase(),
    slug: safeStr(o.slug, MAX_SLUG_LEN),
    title: safeStr(o.title, MAX_TITLE_LEN),
    content: String(o.content ?? ''),
  };
}

function isApiPostById(raw: unknown): raw is Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.slug === 'string' && typeof o.createdAt === 'string';
}

/**
 * Fetches a single post by ID. GET /api/admin/posts/:id. ADMIN only.
 * Throws UNAUTHORIZED, FORBIDDEN, NOT_FOUND, or INVALID_RESPONSE.
 */
export async function getPostById(id: string, signal?: AbortSignal): Promise<ApiPostById> {
  if (!id?.trim()) throw new Error('INVALID_ID');
  const res = await adminFetch(`/posts/${encodeURIComponent(id.trim())}`, {
    method: 'GET',
    credentials: 'include',
    signal,
  });

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 403) throw new Error('FORBIDDEN');
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (!res.ok) throw new Error('FETCH_FAILED');

  const contentType = res.headers.get('Content-Type');
  if (!contentType?.includes('application/json')) throw new Error('INVALID_RESPONSE');

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error('INVALID_JSON');
  }

  if (!isApiPostById(data)) throw new Error('INVALID_RESPONSE');
  const o = data as Record<string, unknown>;
  const rawTranslations = o.translations;
  const translations: PostTranslationItem[] = Array.isArray(rawTranslations)
    ? rawTranslations.map((t: unknown) => parsePostTranslationItem(t))
    : [];

  return {
    id: String(o.id ?? ''),
    slug: safeStr(o.slug, MAX_SLUG_LEN),
    createdAt: String(o.createdAt ?? ''),
    updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : undefined,
    status: typeof o.status === 'string' ? o.status : undefined,
    translations,
  };
}

/**
 * Updates a post. PUT /api/admin/posts/:id. ADMIN only.
 * Sends only slug and translations (no mass assignment of id, createdAt, etc.).
 * Throws UNAUTHORIZED, FORBIDDEN, NOT_FOUND, or FETCH_FAILED.
 */
export async function updatePost(
  id: string,
  payload: ApiPostUpdatePayload,
  signal?: AbortSignal
): Promise<void> {
  if (!id?.trim()) throw new Error('INVALID_ID');
  const res = await adminFetch(`/posts/${encodeURIComponent(id.trim())}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 403) throw new Error('FORBIDDEN');
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (res.status === 409) throw new Error('CONFLICT');
  if (!res.ok) throw new Error('FETCH_FAILED');
}

/**
 * Creates a new post. POST /api/admin/posts. ADMIN only.
 * Returns the created post id; if backend returns 409 but the body contains an id,
 * returns { id, conflict: true } (post was created anyway). Throws UNAUTHORIZED, FORBIDDEN, CONFLICT, or FETCH_FAILED.
 */
export async function createPost(
  payload: ApiPostCreatePayload,
  signal?: AbortSignal
): Promise<{ id: string; conflict?: boolean }> {
  const res = await adminFetch('/posts', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  let data: unknown;
  const contentType = res.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = null;
  }

  const o = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  const postObj = o?.post && typeof o.post === 'object' ? (o.post as Record<string, unknown>) : null;
  const idFromBody =
    (postObj && typeof postObj.id === 'string' ? postObj.id : null) ??
    (o && typeof o.id === 'string' ? o.id : null);

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 403) throw new Error('FORBIDDEN');
  if (res.status === 409) {
    if (idFromBody) return { id: idFromBody, conflict: true };
    throw new Error('CONFLICT');
  }
  if (!res.ok) throw new Error('FETCH_FAILED');

  if (!idFromBody) throw new Error('INVALID_RESPONSE');
  return { id: idFromBody };
}

/**
 * Deletes a post and its translations. DELETE /api/admin/posts/:id. ADMIN only.
 * Throws UNAUTHORIZED, FORBIDDEN, NOT_FOUND, or FETCH_FAILED.
 */
export async function deletePost(id: string, signal?: AbortSignal): Promise<void> {
  if (!id?.trim()) throw new Error('INVALID_ID');
  const res = await adminFetch(`/posts/${encodeURIComponent(id.trim())}`, {
    method: 'DELETE',
    credentials: 'include',
    signal,
  });

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 403) throw new Error('FORBIDDEN');
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (!res.ok) throw new Error('FETCH_FAILED');
}
