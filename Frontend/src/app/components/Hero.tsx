import { ArrowRight, Github, Linkedin, Mail, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FadeIn } from '../../components/motion';
import { DURATION, EASE } from '../../constants/motion';
import { useIsMobile } from './ui/use-mobile';

const HERO_PORTRAIT_SRC = '/hero-portrait.jpeg';

export function Hero() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [portraitRevealed, setPortraitRevealed] = useState(false);

  const handleImgError = () => {
    setImgError(true);
    console.error('[Hero] Immagine non caricata.', { src: HERO_PORTRAIT_SRC });
  };

  const handleImgLoad = () => {
    setImgLoaded(true);
  };

  return (
    <section className="relative min-h-screen flex flex-col bg-[#FAF9F6] overflow-hidden">
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft gradient inspired by golden hour */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5E6D3]/30 via-[#FAF9F6] to-[#E8DDD0]/20"></div>

        {/* Subtle grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px'
          }}
        ></div>

        {/* Soft atmospheric circles - desaturated warmth */}
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#D4A574]/8 to-transparent blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-radial from-[#8B9DAF]/6 to-transparent blur-3xl"></div>

      </div>

      {/* Main content: flex-1 so scroll indicator stays at bottom */}
      <div className="flex-1 flex items-center relative z-10">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16 w-full">
          {/* Grid: 1 col mobile (text then image), 12 col desktop */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8 order-1 pt-20 md:pt-28 lg:pt-16">
            {/* Subtle badge - First to appear */}
            <FadeIn delay={100} duration={DURATION.slow}>
              <div className="inline-flex">
                <span className="px-4 py-1.5 border border-[#D4A574]/30 rounded-full text-[#6B5D4F] text-sm tracking-wide bg-white/40 backdrop-blur-sm">
                  {t('hero.badge')}
                </span>
              </div>
            </FadeIn>
            
            {/* Strong typographic hierarchy - Staggered reveal */}
            <div className="space-y-4">
              <FadeIn delay={200} duration={DURATION.slower}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight text-[#2C2416]">
                  {t('hero.title1')}
                  <br />
                  <span className="font-normal italic text-[#6B5D4F]">{t('hero.title2')}</span>
                  <br />
                  {t('hero.title3')}
                </h1>
              </FadeIn>
              
              {/* Sharp value proposition */}
              <FadeIn delay={400} duration={DURATION.slower}>
                <p className="text-xl md:text-2xl text-[#6B5D4F]/80 font-light max-w-xl leading-relaxed">
                  {t('hero.subtitle')}
                </p>
              </FadeIn>
            </div>

            {/* Minimal CTAs */}
            <FadeIn delay={600} duration={DURATION.slow}>
              <div className="flex flex-wrap gap-4 pt-4">
                <a 
                  href="#projects" 
                  className="group px-7 py-4 min-h-[44px] bg-[#2C2416] text-[#FAF9F6] hover:bg-[#3D3122] transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <span className="font-normal tracking-wide">{t('hero.ctaProjects')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
                <a 
                  href="#contact" 
                  className="px-7 py-4 min-h-[44px] flex items-center border border-[#6B5D4F]/30 text-[#2C2416] hover:border-[#6B5D4F] hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
                >
                  <span className="font-normal tracking-wide">{t('hero.ctaContact')}</span>
                </a>
              </div>
            </FadeIn>

            {/* Refined social links */}
            <FadeIn delay={750} duration={DURATION.slow}>
              <div className="flex gap-3 pt-4">
                <a 
                  href="https://github.com/Kikkocrypto" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center border border-[#6B5D4F]/20 hover:border-[#6B5D4F]/40 text-[#6B5D4F] hover:text-[#2C2416] transition-all duration-300 bg-white/30 backdrop-blur-sm hover-lift"
                  aria-label={t('hero.ariaGitHub')}
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/francesco-damiano-09259b22b/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center border border-[#6B5D4F]/20 hover:border-[#6B5D4F]/40 text-[#6B5D4F] hover:text-[#2C2416] transition-all duration-300 bg-white/30 backdrop-blur-sm hover-lift"
                  aria-label={t('hero.ariaLinkedIn')}
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="mailto:f.damiano@francescodamiano.tech"
                  className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center border border-[#6B5D4F]/20 hover:border-[#6B5D4F]/40 text-[#6B5D4F] hover:text-[#2C2416] transition-all duration-300 bg-white/30 backdrop-blur-sm hover-lift"
                  aria-label={t('hero.ariaEmail')}
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </FadeIn>
          </div>

            {/* Right side - portrait (solo su mobile: overlay "clicca per scoprire") */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end order-2 mt-12 lg:mt-24">
              {isMobile ? (
                <button
                  type="button"
                  onClick={() => setPortraitRevealed(true)}
                  className="relative w-full max-w-[280px] sm:max-w-sm aspect-[3/4] overflow-hidden rounded-[2px] bg-[#E8DDD0]/30 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A574]/50 focus-visible:ring-offset-2"
                  aria-label={portraitRevealed ? t('hero.portraitRevealed') : t('hero.portraitReveal')}
                >
                  <img
                    src={HERO_PORTRAIT_SRC}
                    alt="Damiano Francesco"
                    className={`absolute inset-0 w-full h-full object-cover object-[center_28%] ${imgLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                    style={{
                      filter: 'brightness(1.06) contrast(1.04) saturate(0.92) sepia(0.06)',
                      transition: `opacity ${DURATION.slow}ms ${EASE.elegant}, transform ${DURATION.slow}ms ${EASE.elegant}`,
                    }}
                    onError={handleImgError}
                    onLoad={handleImgLoad}
                    decoding="async"
                    draggable={false}
                  />
                  {imgError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#FAF9F6] border border-[#D4A574]/40 text-left text-sm text-[#2C2416]">
                      <span className="font-medium text-[#6B5D4F] mb-2">Immagine hero non caricata</span>
                      <span className="text-xs text-[#6B5D4F]/80 break-all">Verifica che hero-portrait.jpeg sia in Frontend/public/</span>
                    </div>
                  )}
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 transition-all duration-500 ${EASE.elegant} ${portraitRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-[#2C2416]'}`}
                    aria-hidden={portraitRevealed}
                  >
                    <Sparkles className="w-8 h-8 text-[#D4A574]" />
                    <span className="text-[#FAF9F6] text-sm font-light tracking-wide text-center leading-relaxed">
                      {t('hero.portraitReveal')}
                    </span>
                  </div>
                  {portraitRevealed && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      aria-hidden
                      style={{
                        background: 'linear-gradient(180deg, rgba(250,249,246,0.12) 0%, transparent 40%, transparent 70%, rgba(232,221,208,0.15) 100%)',
                        mixBlendMode: 'soft-light',
                      }}
                    />
                  )}
                </button>
              ) : (
                <div className="relative w-full max-w-[280px] sm:max-w-sm aspect-[3/4] overflow-hidden rounded-[2px] bg-[#E8DDD0]/30">
                  <img
                    src={HERO_PORTRAIT_SRC}
                    alt="Damiano Francesco"
                    className={`absolute inset-0 w-full h-full object-cover object-[center_28%] ${imgLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                    style={{
                      filter: 'brightness(1.06) contrast(1.04) saturate(0.92) sepia(0.06)',
                      transition: `opacity ${DURATION.slow}ms ${EASE.elegant}, transform ${DURATION.slow}ms ${EASE.elegant}`,
                    }}
                    onError={handleImgError}
                    onLoad={handleImgLoad}
                    decoding="async"
                  />
                  {imgError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#FAF9F6] border border-[#D4A574]/40 text-left text-sm text-[#2C2416]">
                      <span className="font-medium text-[#6B5D4F] mb-2">Immagine hero non caricata</span>
                      <span className="text-xs text-[#6B5D4F]/80 break-all">Verifica che hero-portrait.jpeg sia in Frontend/public/</span>
                    </div>
                  )}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    aria-hidden
                    style={{
                      background: 'linear-gradient(180deg, rgba(250,249,246,0.12) 0%, transparent 40%, transparent 70%, rgba(232,221,208,0.15) 100%)',
                      mixBlendMode: 'soft-light',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator: sempre in fondo, centrato, full width */}
      <FadeIn delay={1000} duration={DURATION.slow}>
        <div className="w-full flex justify-center py-8 pb-12 animate-gentle-pulse">
          <a
            href="#about"
            className="flex flex-col items-center gap-2 text-[#6B5D4F]/60 hover:text-[#6B5D4F] transition-colors"
            aria-label={t('hero.ariaScroll')}
          >
            <span className="text-xs tracking-wider uppercase">{t('hero.explore')}</span>
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>
      </FadeIn>
    </section>
  );
}
