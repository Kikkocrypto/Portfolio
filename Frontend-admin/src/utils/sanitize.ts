/**
 * HTML sanitization for rich-text content using DOMPurify.
 * Used on editor change, before submit, and before any preview render.
 * Prevents XSS from script tags, event handlers, iframes, and arbitrary HTML.
 */

import DOMPurify from 'dompurify';

/** Allowed tags for blog content (minimal safe set). */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'ul', 'ol', 'li',
  'a',
  'h2', 'h3', 'h4',
];

/** Allowed attributes (e.g. href only on <a>). */
const ALLOWED_ATTR = ['href', 'target', 'rel'];

/**
 * Sanitizes HTML for storage and display. Strips scripts, event handlers, iframes.
 * Use for: editor onChange, before submit, before dangerouslySetInnerHTML preview.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'], // allow target="_blank" rel="noopener"
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[#])/i,
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false,
  });
}

/**
 * Sanitize and optionally add rel="noopener noreferrer" to external links.
 */
export function sanitizeHtmlForPreview(dirty: string): string {
  const cleaned = sanitizeHtml(dirty);
  if (!cleaned) return '';
  const doc = new DOMParser().parseFromString(cleaned, 'text/html');
  doc.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('http://') || href.startsWith('https://')) {
      a.setAttribute('rel', 'noopener noreferrer');
      a.setAttribute('target', '_blank');
    }
  });
  return doc.body.innerHTML;
}
