import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { Post } from '../types/post';
import { API_BASE } from '../api/config';
import { fetchPostByLocaleAndSlug } from '../api/posts';

/**
 * Restituisce i dati del post per locale e slug dalla route.
 * - Usa i dati passati in location.state (navigazione dalla lista) se presenti.
 * - Altrimenti chiama GET /api/posts/{locale}/{slug}.
 */
export function usePost(
  locale: string | undefined,
  slug: string | undefined
): { post: Post | null; loading: boolean; error: string | null } {
  const location = useLocation();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statePost = location.state?.post as Post | undefined;

  const effectiveLocale = locale && ['it', 'en', 'es'].includes(locale) ? locale : 'it';

  useEffect(() => {
    if (!slug?.trim()) {
      setPost(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (statePost && statePost.slug === slug) {
      setPost(statePost);
      setLoading(false);
      setError(null);
      return;
    }

    if (!API_BASE) {
      setPost(null);
      setLoading(false);
      setError('not_found');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPostByLocaleAndSlug(API_BASE, effectiveLocale, slug)
      .then((p) => {
        if (!cancelled) {
          setPost(p);
          setError(p ? null : 'not_found');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPost(null);
          setError('not_found');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, effectiveLocale, statePost]);

  return useMemo(
    () => ({ post, loading, error }),
    [post, loading, error]
  );
}
