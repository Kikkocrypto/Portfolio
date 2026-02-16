import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '../../components/motion';
import { STAGGER } from '../../constants/motion';
import type { Post } from '../types/post';
import { usePosts } from '../hooks/usePosts';
import { useToast } from '../hooks/useToast.tsx';
import { BlogPostListSkeleton } from './BlogPostSkeleton';
import { BlogEmptyState } from './BlogEmptyState';

/**
 * Blog section component.
 * Displays list of blog posts with secure fetching, i18n support, and error handling.
 * 
 * Security features:
 * - Data validation before rendering
 * - No direct HTML injection
 * - Error boundaries with user feedback
 * - Abort controller for memory leak prevention
 */
export function Blog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { posts, loading, error } = usePosts();
  const { showToast, Toast } = useToast();

  // Show error toast when fetch fails
  useEffect(() => {
    if (error) {
      const errorMessages: Record<string, string> = {
        API_NOT_CONFIGURED: t('blog.errors.apiNotConfigured', 'API not configured. Please check your environment settings.'),
        POSTS_NOT_FOUND: t('blog.errors.postsNotFound', 'No posts found.'),
        SERVER_ERROR: t('blog.errors.serverError', 'Server error. Please try again later.'),
        FETCH_FAILED: t('blog.errors.fetchFailed', 'Failed to load posts. Please try again.'),
        INVALID_RESPONSE_TYPE: t('blog.errors.invalidResponseType', 'Invalid server response.'),
        INVALID_JSON: t('blog.errors.invalidJson', 'Failed to parse server response.'),
        INVALID_DATA_STRUCTURE: t('blog.errors.invalidDataStructure', 'Posts data structure is invalid.'),
        NETWORK_ERROR: t('blog.errors.networkError', 'The server is not available at the moment.'),
        UNKNOWN_ERROR: t('blog.errors.unknownError', 'An unexpected error occurred.'),
      };

      const message = errorMessages[error] || errorMessages.UNKNOWN_ERROR;
      showToast({ message, type: 'error', duration: 6000 });
    }
  }, [error, showToast, t]);

  const handlePostClick = (post: Post) => {
    // Pass post in state so detail page can show it without fetching (avoids 404 for fallback locale)
    navigate(`/blog/${encodeURIComponent(post.slug)}`, { state: { post } });
  };

  return (
    <section id="blog" className="py-32 md:py-40 bg-[#FAF9F6] relative">
      {/* Toast notifications */}
      <Toast />

      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-16 relative">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <ScrollReveal>
            <div className="mb-24 max-w-3xl">
              <div className="inline-block h-px w-20 bg-[#D4A574] mb-8"></div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-[#2C2416] mb-8 leading-[1.1]">
                {t('blog.title')}
              </h2>
              <p className="text-xl md:text-2xl text-[#6B5D4F]/70 font-light leading-relaxed">
                {t('blog.subtitle')}
              </p>
            </div>
          </ScrollReveal>

          {/* Loading state */}
          {loading && <BlogPostListSkeleton count={3} />}

          {/* Empty state (no posts) */}
          {!loading && !error && posts.length === 0 && (
            <BlogEmptyState
              message={t('blog.empty.title', 'No reflections yet')}
              description={t('blog.empty.description', 'Check back soon for new stories and insights.')}
            />
          )}

          {/* Posts list */}
          {!loading && !error && posts.length > 0 && (
            <>
              <div className="space-y-1">
                {posts.map((post, index) => (
                  <ScrollReveal key={post.id} delay={index * STAGGER.comfortable}>
                    <article
                      onClick={() => handlePostClick(post)}
                      className="group cursor-pointer py-12 border-t border-[#D4A574]/10 hover:border-[#D4A574]/30 transition-all duration-500"
                    >
                      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Date column */}
                        <div className="lg:col-span-3">
                          <div className="flex items-center gap-3 text-sm text-[#6B5D4F]/60 tracking-wide mb-3 lg:mb-0">
                            {/* Security: date is formatted by our service, not raw backend data */}
                            <span>{post.date}</span>
                            {post.readTime && (
                              <>
                                <span className="hidden lg:inline">•</span>
                                <span>{post.readTime}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Content column */}
                        <div className="lg:col-span-9 space-y-4">
                          {/* Security: title is plain text, React automatically escapes it */}
                          <h3 className="text-3xl md:text-4xl font-light text-[#2C2416] leading-tight group-hover:text-[#6B5D4F] group-hover:font-normal transition-all duration-500">
                            {post.title}
                          </h3>

                          {/* Security: excerpt is plain text, React automatically escapes it */}
                          <p className="text-lg md:text-xl text-[#6B5D4F]/70 leading-relaxed font-light group-hover:text-[#6B5D4F]/80 transition-colors duration-500">
                            {post.excerpt}
                          </p>

                          {post.translationNotAvailableForLocale && (
                            <p className="text-xs text-[#6B5D4F]/60 italic">
                              {t('blog.translationNotAvailable')}
                            </p>
                          )}

                          <div className="flex items-center gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <span className="text-sm text-[#2C2416] tracking-wide link-underline">
                              {t('blog.readReflection')}
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#2C2416] group-hover:translate-x-1 transition-transform duration-300" />
                          </div>

                          {post.location && (
                            <div className="pt-2">
                              {/* Security: location is plain text, React automatically escapes it */}
                              <span className="text-xs text-[#6B5D4F]/50 italic tracking-wide">
                                {post.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>

              {/* Footer note */}
              <ScrollReveal delay={400}>
                <div className="mt-24 pt-12 border-t border-[#D4A574]/10 max-w-3xl">
                  <p className="text-lg text-[#6B5D4F]/60 italic leading-relaxed">
                    {t('blog.footerNote')}
                  </p>
                </div>
              </ScrollReveal>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
