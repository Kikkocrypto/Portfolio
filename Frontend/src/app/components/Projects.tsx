import { ExternalLink, Github, ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEffect, useRef, useState } from 'react';

export function Projects() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;
      
      // Calculate scroll progress through the section
      const scrolled = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / (sectionHeight + windowHeight)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredProject = {
    title: 'Piattaforma E-Commerce',
    subtitle: 'Esperienza di acquisto digitale completa',
    description: 'Una soluzione e-commerce full-stack costruita da zero. Partendo da ricerche utente nel quartiere della moda a Milano, ho progettato un sistema che unisce presentazione elegante dei prodotti e checkout fluido. La dashboard admin si ispira ai sistemi minimalisti che ho osservato nelle boutique di Tokyo.',
    challenge: 'Creare una piattaforma che sembri personale e curata, non corporate. La sfida è costruire fiducia attraverso il design mantenendo la solidità tecnica necessaria per transazioni sicure.',
    approach: [
      'Interviste utente in tre città per capire i comportamenti d\'acquisto',
      'Prototipazione iterativa con dati reali di artigiani locali',
      'Ottimizzazione delle performance per clienti internazionali con connessioni diverse'
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'],
    image: 'https://images.unsplash.com/photo-1554306274-f23873d9a26c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwcHJvamVjdCUyMGNvZGluZyUyMHNjcmVlbnxlbnwxfHx8fDE3NzAyMjQ5ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    github: 'https://github.com',
    demo: 'https://example.com',
    year: '2024'
  };

  const additionalWork = {
    title: 'Task Manager',
    description: 'Real-time collaboration tool inspired by the fluid communication styles I noticed in remote teams across Europe.',
    tags: ['Next.js', 'TypeScript', 'MongoDB'],
    github: 'https://github.com',
    demo: 'https://example.com'
  };

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
          <div className="mb-24 md:mb-32 max-w-3xl">
            <div className="inline-block h-px w-20 bg-[#D4A574] mb-8"></div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-[#2C2416] mb-8 leading-[1.1]">
              Progetti in evidenza
            </h2>
            <p className="text-xl md:text-2xl text-[#6B5D4F]/70 font-light leading-relaxed">
              Una selezione di progetti realizzati con intenzione, ispirati da prospettive diverse
            </p>
          </div>

          {/* Featured Project - Editorial Layout */}
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
                  className="relative overflow-hidden border border-[#D4A574]/10"
                  style={{
                    transform: `translateY(${scrollProgress * -20}px)`,
                    transition: 'transform 0.1s ease-out'
                  }}
                >
                  <ImageWithFallback
                    src={featuredProject.image}
                    alt={featuredProject.title}
                    className="w-full aspect-[16/10] object-cover"
                  />
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
                      Approccio
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
                        className="px-4 py-2 text-sm text-[#6B5D4F] border border-[#D4A574]/20 tracking-wide"
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
                      className="group flex items-center gap-2 text-[#2C2416] hover:text-[#6B5D4F] transition-colors"
                    >
                      <Github className="w-5 h-5" />
                      <span className="text-sm tracking-wide border-b border-transparent group-hover:border-[#6B5D4F] transition-all">
                        Vedi codice
                      </span>
                    </a>
                    <a 
                      href={featuredProject.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-[#2C2416] hover:text-[#6B5D4F] transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span className="text-sm tracking-wide border-b border-transparent group-hover:border-[#6B5D4F] transition-all">
                        Visit site
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Additional Work - Minimal Mention */}
          <div className="max-w-4xl">
            <h3 className="text-2xl md:text-3xl font-light text-[#2C2416] mb-12 tracking-wide">
              Altri progetti
            </h3>
            
            <article className="group border-t border-[#D4A574]/10 py-10 hover:border-[#D4A574]/30 transition-all duration-500">
              <div className="grid md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-8">
                  <h4 className="text-2xl font-light text-[#2C2416] mb-4 group-hover:text-[#6B5D4F] transition-colors">
                    {additionalWork.title}
                  </h4>
                  <p className="text-lg text-[#6B5D4F]/70 leading-relaxed font-light mb-6">
                    {additionalWork.description}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {additionalWork.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="text-sm text-[#6B5D4F]/60 tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-4 flex md:justify-end items-start gap-4">
                  <a 
                    href={additionalWork.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link p-2 text-[#6B5D4F] hover:text-[#2C2416] transition-colors"
                    aria-label="Vedi codice"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a 
                    href={additionalWork.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link p-2 text-[#6B5D4F] hover:text-[#2C2416] transition-colors"
                    aria-label="Visita il sito"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </article>

            {/* Footer note */}
            <div className="mt-20 pt-12 border-t border-[#D4A574]/10">
              <p className="text-[#6B5D4F]/60 italic leading-relaxed max-w-2xl">
                Altri progetti e contributi open source su{' '}
                <a 
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2C2416] hover:text-[#6B5D4F] transition-colors border-b border-[#D4A574]/30 hover:border-[#6B5D4F]"
                >
                  GitHub
                </a>
                . In cerca di nuove collaborazioni per esperienze digitali significative.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
