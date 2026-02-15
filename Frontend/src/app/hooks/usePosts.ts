import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Post } from '../types/post';
import { fetchPostsForLanguage } from '../api/posts';

interface UsePostsResult {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and manage blog posts with i18n support.
 * 
 * Features:
 * - Automatic language detection from i18n
 * - Secure data fetching with validation
 * - AbortController for cleanup
 * - Memoized results for performance
 * - Re-fetch on language change
 * 
 * @returns Object with posts array, loading state, and error message
 */
export function usePosts(): UsePostsResult {
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get current language from i18n instance (don't read localStorage directly)
  const currentLang = i18n.language || 'en';

  useEffect(() => {
    // Create AbortController for cleanup
    const abortController = new AbortController();
    const { signal } = abortController;

    async function loadPosts() {
      setLoading(true);
      setError(null);

      try {
        const fetchedPosts = await fetchPostsForLanguage(currentLang, signal);
        
        // Only update state if not aborted
        if (!signal.aborted) {
          setPosts(fetchedPosts);
        }
      } catch (err) {
        // Ignore AbortError (cleanup, not actual error)
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        // Only update state if not aborted
        if (!signal.aborted) {
          // Map error codes to user-friendly messages
          const errorMessage = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
          setError(errorMessage);
          setPosts([]);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    // Cleanup: abort fetch on unmount or language change
    return () => {
      abortController.abort();
    };
  }, [currentLang]);

  // Memoize result to prevent unnecessary re-renders
  return useMemo(
    () => ({ posts, loading, error }),
    [posts, loading, error]
  );
}
