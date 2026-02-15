/**
 * PROGETTI – Linee guida per aggiungere progetti
 * -----------------------------------------------
 *
 * 1) PROGETTO IN EVIDENZA (uno solo, in alto)
 *    Modifica l’oggetto `featuredProject` sotto:
 *    - title: nome del progetto
 *    - subtitle: riga sotto il titolo (es. "Applicazione web full-stack per...")
 *    - description: paragrafo principale
 *    - challenge: testo della sezione "Sfida"
 *    - approach: array di stringhe (punti elenco "Approccio")
 *    - technologies: array di stringhe (tag tecnologie)
 *    - image: URL o import dell’immagine (es. new URL('../../assets/tua-foto.png', import.meta.url).href)
 *    - github: link al repo
 *    - demo: link al sito/demo
 *    - year: anno o label (es. "2026 - tesi")
 *
 * 2) ALTRI PROGETTI (lista sotto)
 *    Aggiungi un nuovo oggetto nell’array `additionalProjects` con:
 *    - title: nome
 *    - description: breve descrizione
 *    - tags: array di stringhe (tecnologie)
 *    - github: link (usa "#" se non hai repo)
 *    - demo: link (usa "#" se non hai demo)
 *
 * Per un nuovo progetto in evidenza al posto di quello attuale, sostituisci tutto
 * l’oggetto `featuredProject` e aggiorna l’import dell’immagine in cima al file.
 */

import { useTranslation, Trans } from 'react-i18next';
import { ExternalLink, Github, ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useRef } from 'react';
import { ScrollReveal } from '../../components/motion';
import { useScrollProgress } from '../../utils/motion';
import { DURATION } from '../../constants/motion';

const projectImage = new URL('../../assets/Screenshot 2026-02-14 172842.png', import.meta.url).href;

export function Projects() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollProgress = useScrollProgress(sectionRef);

  const featuredData = t('projects.featured', { returnObjects: true }) as { title: string; subtitle: string; description: string; challenge: string; approach: string[]; technologies: string[]; year: string };
  const featuredProject = {
    ...featuredData,
    image: projectImage,
    github: 'https://github.com/your-username/your-project-name',
    demo: 'https://dottori-dolori.xyz/',
  };

  const additionalData = t('projects.additional', { returnObjects: true }) as { title: string; description: string; tags: string[] }[];
  const additionalProjects = additionalData.map((p, i) => ({
    ...p,
    github: i === 0 ? 'https://github.com/Kikkocrypto/Wellbook-APP' : 'https://github.com/Kikkocrypto/CRUD_application_PCLP2pj',
  }));

  return (
    <section 
      ref={sectionRef}
      id="projects" 
      className="py-32 md:py-40 bg-white relative overflow-hidden"
    >
      {/* Subtle animated background element */}
      <div 
        className="absolute top-1/4 right-0 w-[800px] h-[800px] rounded-full bg-gradient-radial from-[#D4A574]/3 to-transparent pointer-events-none"
        style={{
          transform: `scale(${0.8 + scrollProgress * 0.2}) translateX(${scrollProgress * 100}px)`,
          opacity: 0.6,
          transition: 'transform 0.1s ease-out'
        }}
      ></div>

      {/* Texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-16 relative">
        <div className="max-w-7xl mx-auto">
          {/* Header - asymmetrical */}
          <ScrollReveal>
            <div className="mb-24 md:mb-32 max-w-3xl">
              <div className="inline-block h-px w-20 bg-[#D4A574] mb-8"></div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-[#2C2416] mb-8 leading-[1.1]">
                {t('projects.sectionTitle')}
              </h2>
              <p className="text-xl md:text-2xl text-[#6B5D4F]/70 font-light leading-relaxed">
                {t('projects.sectionSubtitle')}
              </p>
            </div>
          </ScrollReveal>

          {/* Featured Project - Editorial Layout */}
          <ScrollReveal delay={100}>
            <article className="mb-32 md:mb-40">
              {/* Year & Title Block */}
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 mb-16">
                <div className="lg:col-span-3">
                  <div className="sticky top-32">
                    <span className="block text-sm tracking-[0.3em] text-[#D4A574] mb-4 uppercase">
                      {featuredProject.year}
                    </span>
                    <h3 className="text-4xl md:text-5xl font-light text-[#2C2416] leading-tight mb-4">
                      {featuredProject.title}
                    </h3>
                    <p className="text-lg text-[#6B5D4F]/60 italic">
                      {featuredProject.subtitle}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-9 space-y-12">
                  {/* Main Image - No card, just image with subtle border */}
                  <div 
                    className="relative overflow-hidden border border-[#D4A574]/10 hover:border-[#D4A574]/20 transition-colors duration-500"
                    style={{
                      transform: `translateY(${scrollProgress * -20}px)`,
                      transition: 'transform 0.1s ease-out',
                      boxShadow: '0 4px 20px rgba(212, 165, 116, 0.12)'
                    }}
                  >
                    <div className="overflow-hidden">
                      <ImageWithFallback
                        src={featuredProject.image}
                        alt={featuredProject.title}
                        className="w-full aspect-[16/10] object-cover object-center"
                      />
                    </div>
                  </div>

                {/* Description */}
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-[#3D3122]/80 leading-relaxed font-light mb-8">
                    {featuredProject.description}
                  </p>
                </div>

                {/* Challenge & Approach Grid */}
                <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-[#D4A574]/10">
                  <div>
                    <h4 className="text-sm tracking-[0.2em] text-[#6B5D4F]/60 mb-4 uppercase">
                      Sfida
                    </h4>
                    <p className="text-lg text-[#3D3122]/80 leading-relaxed font-light">
                      {featuredProject.challenge}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm tracking-[0.2em] text-[#6B5D4F]/60 mb-4 uppercase">
                      {t('projects.approach')}
                    </h4>
                    <ul className="space-y-3">
                      {featuredProject.approach.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[#3D3122]/80 leading-relaxed">
                          <span className="block w-1.5 h-1.5 bg-[#D4A574] rounded-full mt-2.5 flex-shrink-0"></span>
                          <span className="font-light">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Technologies & Links */}
                <div className="flex flex-wrap items-center justify-between gap-8 pt-8 border-t border-[#D4A574]/10">
                  <div className="flex flex-wrap gap-3">
                    {featuredProject.technologies.map((tech, idx) => (
                      <span 
                        key={idx}
                        className="px-4 py-2 text-sm text-[#6B5D4F] border border-[#D4A574]/20 tracking-wide hover:border-[#D4A574]/40 hover:bg-white/50 transition-all duration-300 cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-6">
                    <a 
                      href={featuredProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-[#2C2416] hover:text-[#6B5D4F] transition-colors duration-300"
                    >
                      <Github className="w-5 h-5" />
                      <span className="text-sm tracking-wide link-underline">
                        Vedi codice
                      </span>
                    </a>
                    <a 
                      href={featuredProject.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-[#2C2416] hover:text-[#6B5D4F] transition-colors duration-300"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span className="text-sm tracking-wide link-underline">
                        Vai al sito
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </ScrollReveal>

          {/* Additional Work - Minimal Mention */}
          <ScrollReveal delay={200}>
            <div className="max-w-4xl">
              <h3 className="text-2xl md:text-3xl font-light text-[#2C2416] mb-12 tracking-wide">
                {t('projects.otherProjects')}
              </h3>
              
              {additionalProjects.map((project, idx) => (
                <article key={idx} className="group border-t border-[#D4A574]/10 py-10 hover:border-[#D4A574]/30 transition-all duration-500">
                  <div className="grid md:grid-cols-12 gap-8 items-start">
                    <div className="md:col-span-8">
                      <h4 className="text-2xl font-light text-[#2C2416] mb-4 group-hover:text-[#6B5D4F] transition-colors duration-500">
                        {project.title}
                      </h4>
                      <p className="text-lg text-[#6B5D4F]/70 leading-relaxed font-light mb-6">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {project.tags.map((tag, tagIdx) => (
                          <span 
                            key={tagIdx}
                            className="text-sm text-[#6B5D4F]/60 tracking-wide"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-4 flex md:justify-end items-start gap-4">
                      <a 
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link p-2 text-[#6B5D4F] hover:text-[#2C2416] transition-colors duration-300 hover-lift"
                        aria-label={t('projects.ariaViewCode')}
                      >
                        <Github className="w-5 h-5" />
                      </a>
                      {'demo' in project && project.demo && (
                        <a 
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link p-2 text-[#6B5D4F] hover:text-[#2C2416] transition-colors duration-300 hover-lift"
                          aria-label={t('projects.ariaVisitSite')}
                        >
                          <ArrowUpRight className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {/* Footer note */}
              <div className="mt-20 pt-12 border-t border-[#D4A574]/10">
                <p className="text-[#6B5D4F]/60 italic leading-relaxed max-w-2xl">
                  <Trans
                    i18nKey="projects.footerNote"
                    components={{
                      0: <a href="https://github.com/Kikkocrypto" target="_blank" rel="noopener noreferrer" className="text-[#2C2416] hover:text-[#6B5D4F] transition-colors duration-300 link-underline" />
                    }}
                  />
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
