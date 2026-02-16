/**
 * Single locale translation block for a blog post.
 */
export interface PostTranslation {
  title: string;
  content: string;
}

/**
 * Post as returned by GET /api/admin/posts.
 * translations: { en: { title, content }, it: { title, content }, ... }
 */
export interface ApiPost {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  translations: Record<string, PostTranslation>;
}

/**
 * Single translation as returned by GET /api/admin/posts/:id (array item).
 */
export interface PostTranslationItem {
  id: string;
  postId: string;
  locale: string;
  slug: string;
  title: string;
  content: string;
}

/**
 * Post as returned by GET /api/admin/posts/:id (full edit shape).
 */
export interface ApiPostById {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  translations: PostTranslationItem[];
}

/**
 * Payload for PUT /api/admin/posts/:id.
 * slug, status and translations; no mass assignment of id, createdAt, etc.
 */
export interface ApiPostUpdatePayload {
  slug: string;
  status?: string;
  translations: Array<{
    id?: string;
    locale: string;
    slug?: string;
    title: string;
    content: string;
  }>;
}

/**
 * Payload for POST /api/admin/posts (create new post).
 * Same shape as update but translations have no id.
 */
export interface ApiPostCreatePayload {
  slug: string;
  status?: string;
  translations: Array<{
    locale: string;
    slug?: string;
    title: string;
    content: string;
  }>;
}

/**
 * Normalized post for UI: id, slug, dates, title, status, and available locales.
 */
export interface BlogPostDisplay {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  status?: string;
  /** Codici lingua disponibili (es. ['it', 'en']). */
  locales: string[];
}
