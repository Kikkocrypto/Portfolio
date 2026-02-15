/**
 * Translation for a single post.
 * Represents one language version of a blog post.
 */
export interface PostTranslation {
  id?: string;
  locale: string;
  slug?: string;
  title: string;
  content: string;
}

/**
 * Backend response structure for a single post.
 * Contains all translations and metadata.
 */
export interface PostBackendResponse {
  id: string;
  slug?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  translations: PostTranslation[];
}

/**
 * UI-ready Post type.
 * This is what components consume after selecting the correct translation.
 */
export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  locale: string;
  createdAt: string;
  readTime?: string;
  location?: string;
}

/**
 * Type guard to validate if data matches PostBackendResponse structure.
 */
export function isValidPostBackendResponse(data: unknown): data is PostBackendResponse {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  // Required fields validation
  if (typeof obj.id !== 'string' || !obj.id) return false;
  if (typeof obj.status !== 'string' || !obj.status) return false;
  if (typeof obj.createdAt !== 'string' || !obj.createdAt) return false;
  
  // Translations must be an array
  if (!Array.isArray(obj.translations)) return false;
  
  // Each translation must have required fields
  return obj.translations.every((t: unknown) => {
    if (!t || typeof t !== 'object') return false;
    const trans = t as Record<string, unknown>;
    return (
      typeof trans.locale === 'string' &&
      typeof trans.title === 'string' &&
      typeof trans.content === 'string' &&
      trans.locale.length > 0 &&
      trans.title.length > 0 &&
      trans.content.length > 0
    );
  });
}

/**
 * Type guard to validate array of posts.
 */
export function isValidPostsArray(data: unknown): data is PostBackendResponse[] {
  return Array.isArray(data) && data.every(isValidPostBackendResponse);
}
