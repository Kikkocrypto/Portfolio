import { useMemo } from 'react';

export type SupportedLocale = 'en' | 'it';

const DEFAULT_LOCALE: SupportedLocale = 'en';
const FALLBACK_ORDER: SupportedLocale[] = ['en', 'it'];

/**
 * Returns current UI language. Ready for future i18n context (e.g. react-i18next).
 * Use for post title fallback: try current locale, then fallback chain, then empty.
 */
export function useLanguage(): SupportedLocale {
  return useMemo(() => {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const lang = navigator.language.slice(0, 2).toLowerCase();
      if (lang === 'it' || lang === 'en') return lang as SupportedLocale;
    }
    return DEFAULT_LOCALE;
  }, []);
}

/**
 * Picks display title from post translations with fallback chain.
 * Prevents crashes when a locale is missing; never render raw HTML.
 */
export function getTitleForLocale(
  translations: Record<string, { title: string; content: string }> | undefined,
  locale: SupportedLocale
): string {
  if (!translations || typeof translations !== 'object') return '';
  const current = translations[locale]?.title;
  if (typeof current === 'string' && current.trim()) return current.trim();
  for (const fallback of FALLBACK_ORDER) {
    if (fallback === locale) continue;
    const t = translations[fallback]?.title;
    if (typeof t === 'string' && t.trim()) return t.trim();
  }
  return '';
}
