/**
 * Validation utilities for blog edit form.
 * Used to validate slug, locale, title, content length, and prevent duplicate locales.
 */

/** Slug: lowercase alphanumeric, hyphens; 1–255 chars. */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_SLUG_LEN = 255;
export const MIN_SLUG_LEN = 1;

/** Language code: 2–5 lowercase letters (e.g. en, it, pt-BR). */
const LOCALE_REGEX = /^[a-z]{2}(-[a-z]{2,4})?$/;
export const MAX_LOCALE_LEN = 10;

export const MAX_TITLE_LEN = 200;
export const MAX_CONTENT_LEN = 100_000;

export interface SlugResult {
  valid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Converts a title (or any string) into a URL-safe slug: lowercase, hyphens, no spaces.
 * Trims and caps length to MAX_SLUG_LEN.
 */
export function slugify(value: unknown): string {
  if (value == null) return '';
  let s = String(value).trim().toLowerCase();
  // Replace accents (basic Latin-1)
  s = s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  // Allow only letters, numbers, spaces, hyphens; replace spaces and invalid with hyphen
  s = s.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  s = s.replace(/^-+/, '').replace(/-+$/, '');
  return s.length > MAX_SLUG_LEN ? s.slice(0, MAX_SLUG_LEN) : s;
}

/**
 * Validates and normalizes slug. Returns normalized slug (lowercase, trimmed) or error.
 */
export function validateSlug(value: unknown): SlugResult {
  if (value == null) return { valid: false, error: 'Slug obbligatorio' };
  const s = String(value).trim().toLowerCase();
  if (s.length < MIN_SLUG_LEN) return { valid: false, error: 'Slug troppo corto' };
  if (s.length > MAX_SLUG_LEN) return { valid: false, error: `Slug massimo ${MAX_SLUG_LEN} caratteri` };
  if (!SLUG_REGEX.test(s)) return { valid: false, error: 'Slug: solo lettere minuscole, numeri e trattini' };
  return { valid: true, normalized: s };
}

export interface LocaleResult {
  valid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Validates language code (e.g. en, it). Returns normalized lowercase code or error.
 */
export function validateLocale(value: unknown): LocaleResult {
  if (value == null) return { valid: false, error: 'Lingua obbligatoria' };
  const s = String(value).trim().toLowerCase();
  if (s.length < 2) return { valid: false, error: 'Codice lingua troppo corto' };
  if (s.length > MAX_LOCALE_LEN) return { valid: false, error: `Codice massimo ${MAX_LOCALE_LEN} caratteri` };
  if (!LOCALE_REGEX.test(s)) return { valid: false, error: 'Codice lingua non valido (es. en, it)' };
  return { valid: true, normalized: s };
}

/**
 * Trims title and enforces max length.
 */
export function trimTitle(value: unknown): string {
  if (value == null) return '';
  const s = String(value).trim();
  return s.length > MAX_TITLE_LEN ? s.slice(0, MAX_TITLE_LEN) : s;
}

/**
 * Trims content and enforces max length (for HTML string).
 */
export function trimContent(value: unknown): string {
  if (value == null) return '';
  const s = String(value).trim();
  return s.length > MAX_CONTENT_LEN ? s.slice(0, MAX_CONTENT_LEN) : s;
}

/**
 * Returns duplicate locale codes from a list. Empty array = no duplicates.
 */
export function findDuplicateLocales(locales: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const loc of locales) {
    const n = loc.trim().toLowerCase();
    if (!n) continue;
    if (seen.has(n)) duplicates.add(n);
    else seen.add(n);
  }
  return [...duplicates];
}
