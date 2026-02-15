import type { Post, PostBackendResponse, PostTranslation } from '../types/post';
import { isValidPostsArray } from '../types/post';
import { API_BASE } from './config';

/**
 * Formats ISO date string to a localized short format.
 * @param createdAt - ISO date string
 * @returns Formatted date string (e.g., "15 Feb 2026")
 */
function formatDate(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    // Validate date
    if (isNaN(date.getTime())) {
      return createdAt;
    }
    return date.toLocaleDateString('it-IT', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  } catch {
    return createdAt;
  }
}

/**
 * Estimates reading time based on content length.
 * Average reading speed: ~200 words per minute.
 * @param content - Post content text
 * @returns Formatted reading time (e.g., "5 min")
 */
function estimateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min`;
}

/**
 * Creates a safe excerpt from content.
 * Truncates at word boundary and adds ellipsis if needed.
 * @param content - Full post content
 * @param maxLength - Maximum character length (default: 200)
 * @returns Safe excerpt string
 */
function createExcerpt(content: string, maxLength: number = 200): string {
  if (!content) return '';
  
  if (content.length <= maxLength) {
    return content;
  }
  
  // Truncate at word boundary
  const truncated = content.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace).trim() + '…';
  }
  
  return truncated.trim() + '…';
}

/**
 * Selects the appropriate translation based on current language.
 * Falls back to English, then to first available translation.
 * 
 * @param translations - Array of post translations
 * @param currentLang - Current i18n language code
 * @returns Selected translation or null if none available
 */
function selectTranslation(
  translations: PostTranslation[],
  currentLang: string
): PostTranslation | null {
  if (!translations || translations.length === 0) {
    return null;
  }

  // 1. Try current language
  const currentLangTranslation = translations.find(
    (t) => t.locale.toLowerCase() === currentLang.toLowerCase()
  );
  if (currentLangTranslation) {
    return currentLangTranslation;
  }

  // 2. Fallback to English
  const englishTranslation = translations.find(
    (t) => t.locale.toLowerCase() === 'en'
  );
  if (englishTranslation) {
    return englishTranslation;
  }

  // 3. Fallback to first available translation
  return translations[0];
}

/**
 * Maps backend post response to UI-ready Post object.
 * Selects appropriate translation and formats data for display.
 * 
 * @param backendPost - Post data from backend
 * @param currentLang - Current i18n language code
 * @returns UI-ready Post object or null if translation not available
 */
export function mapBackendPostToUIPost(
  backendPost: PostBackendResponse,
  currentLang: string
): Post | null {
  const translation = selectTranslation(backendPost.translations, currentLang);
  
  if (!translation) {
    return null;
  }

  return {
    id: backendPost.id,
    slug: translation.slug || backendPost.slug || '',
    title: translation.title,
    content: translation.content,
    excerpt: createExcerpt(translation.content),
    date: formatDate(backendPost.createdAt),
    locale: translation.locale,
    createdAt: backendPost.createdAt,
    readTime: estimateReadTime(translation.content),
  };
}

/**
 * Fetches all published posts from backend.
 * Implements security best practices:
 * - AbortController for cleanup
 * - Response validation before parsing
 * - Type guards for runtime safety
 * - Error boundary for network issues
 * 
 * @param signal - AbortSignal for request cancellation
 * @returns Array of backend post responses
 * @throws Error with user-friendly message on failure
 */
export async function fetchAllPosts(signal?: AbortSignal): Promise<PostBackendResponse[]> {
  if (!API_BASE) {
    throw new Error('API_NOT_CONFIGURED');
  }

  const url = `${API_BASE}/api/posts`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Do NOT include credentials unless backend requires authentication for public posts
      credentials: 'omit',
      signal,
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('POSTS_NOT_FOUND');
      }
      if (response.status >= 500) {
        throw new Error('SERVER_ERROR');
      }
      throw new Error('FETCH_FAILED');
    }

    // Validate Content-Type
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('INVALID_RESPONSE_TYPE');
    }

    // Parse JSON safely
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error('INVALID_JSON');
    }

    // Validate response structure
    if (!isValidPostsArray(data)) {
      // Log only in development (avoid exposing data in production)
      if (import.meta.env.DEV) {
        console.error('[fetchAllPosts] Invalid response structure:', data);
      }
      throw new Error('INVALID_DATA_STRUCTURE');
    }

    return data;
  } catch (error) {
    // Handle AbortError gracefully (not an actual error)
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    // Network errors
    if (error instanceof TypeError) {
      throw new Error('NETWORK_ERROR');
    }

    // Re-throw our custom errors
    if (error instanceof Error && error.message.startsWith('POSTS_') || 
        error instanceof Error && ['API_NOT_CONFIGURED', 'SERVER_ERROR', 'FETCH_FAILED', 'INVALID_RESPONSE_TYPE', 'INVALID_JSON', 'INVALID_DATA_STRUCTURE', 'NETWORK_ERROR'].includes(error.message)) {
      throw error;
    }

    // Unknown error
    throw new Error('UNKNOWN_ERROR');
  }
}

/**
 * High-level function to fetch and map posts for current language.
 * Handles the full pipeline: fetch -> validate -> select translation -> map to UI format.
 * 
 * @param currentLang - Current i18n language code
 * @param signal - AbortSignal for request cancellation
 * @returns Array of UI-ready Post objects
 */
export async function fetchPostsForLanguage(
  currentLang: string,
  signal?: AbortSignal
): Promise<Post[]> {
  const backendPosts = await fetchAllPosts(signal);
  
  return backendPosts
    .map((post) => mapBackendPostToUIPost(post, currentLang))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      // Sort by date descending (newest first)
      try {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } catch {
        return 0;
      }
    });
}

/**
 * Fetches a single post by locale and slug.
 * Used for post detail pages.
 * 
 * @param baseUrl - API base URL
 * @param locale - Language code (e.g., 'it', 'en', 'es')
 * @param slug - Post slug
 * @returns Post object or null if not found
 */
export async function fetchPostByLocaleAndSlug(
  baseUrl: string,
  locale: string,
  slug: string
): Promise<Post | null> {
  if (!baseUrl) {
    return null;
  }

  const url = `${baseUrl}/api/posts/${locale}/${encodeURIComponent(slug)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'omit',
    });

    if (!response.ok) {
      return null;
    }

    // Validate Content-Type
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    // Parse JSON safely
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      return null;
    }

    // Validate structure (assuming backend returns single post with translation)
    if (!data || typeof data !== 'object') {
      return null;
    }

    const apiPost = data as Record<string, unknown>;

    // Map to Post format
    return {
      id: typeof apiPost.id === 'string' ? apiPost.id : '',
      slug: typeof apiPost.slug === 'string' ? apiPost.slug : slug,
      title: typeof apiPost.title === 'string' ? apiPost.title : '',
      content: typeof apiPost.content === 'string' ? apiPost.content : '',
      excerpt: typeof apiPost.content === 'string' ? createExcerpt(apiPost.content) : '',
      date: typeof apiPost.createdAt === 'string' ? formatDate(apiPost.createdAt) : '',
      locale: typeof apiPost.locale === 'string' ? apiPost.locale : locale,
      createdAt: typeof apiPost.createdAt === 'string' ? apiPost.createdAt : '',
      readTime: typeof apiPost.content === 'string' ? estimateReadTime(apiPost.content) : undefined,
    };
  } catch (error) {
    // Network errors or other issues
    return null;
  }
}
