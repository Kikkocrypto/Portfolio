import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowRight } from 'lucide-react';
import { usePost } from '../hooks/usePost';

export function ReflectionPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language && ['it', 'en', 'es'].includes(i18n.language) ? i18n.language : 'it';
  const { post, loading, error } = usePost(locale, slug ?? undefined);

  const handleBack = () => {
    navigate('/#blog', { replace: true });
  };

  if (loading) {
    return (
      <section className="py-24 md:py-32 bg-[#FAF9F6] min-h-screen flex items-center justify-center">
        <p className="text-[#6B5D4F]/70">{t('blog.loading')}</p>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="py-24 md:py-32 bg-[#FAF9F6] min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-[#6B5D4F]/80">{t('blog.notFound')}</p>
        <button
          onClick={handleBack}
          className="text-[#2C2416] hover:text-[#6B5D4F] border-b border-[#D4A574]/30 hover:border-[#2C2416] pb-0.5 transition-colors"
        >
          {t('blog.backToReflections')}
        </button>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 bg-[#FAF9F6] min-h-screen relative">
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-16 relative">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleBack}
            className="group flex items-center gap-3 text-[#6B5D4F] hover:text-[#2C2416] transition-colors mb-16 -ml-1"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span className="tracking-wide text-sm">{t('blog.backToReflections')}</span>
          </button>

          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#2C2416] mb-8 leading-[1.15]">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#6B5D4F]/60 tracking-wide pb-8 border-b border-[#D4A574]/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              {post.readTime && (
                <>
                  <span>•</span>
                  <span>{post.readTime} {t('blog.readTimeLabel')}</span>
                </>
              )}
              {post.location && (
                <>
                  <span>•</span>
                  <span className="italic">{post.location}</span>
                </>
              )}
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            <div className="text-lg md:text-xl text-[#3D3122]/90 leading-relaxed font-light space-y-6">
              {post.reflection.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          <footer className="mt-20 pt-12 border-t border-[#D4A574]/10">
            <button
              onClick={handleBack}
              className="text-[#6B5D4F] hover:text-[#2C2416] transition-colors tracking-wide border-b border-[#D4A574]/30 hover:border-[#2C2416] pb-0.5"
            >
              {t('blog.readOtherReflections')}
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
}
