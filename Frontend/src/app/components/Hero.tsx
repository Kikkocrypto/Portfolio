import { ArrowRight, Github, Linkedin, Mail, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation on mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center bg-[#FAF9F6] overflow-hidden">
      {/* Atmospheric background layers */}
      <div className="absolute inset-0">
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

      <div className="container mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        {/* Asymmetrical layout - content aligned left */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div 
            className={`lg:col-span-7 space-y-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Subtle badge */}
            <div className="inline-flex">
              <span className="px-4 py-1.5 border border-[#D4A574]/30 rounded-full text-[#6B5D4F] text-sm tracking-wide bg-white/40 backdrop-blur-sm">
                Aperto a nuove opportunità
              </span>
            </div>
            
            {/* Strong typographic hierarchy */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight text-[#2C2416]">
                Creo esperienze
                <br />
                <span className="font-normal italic text-[#6B5D4F]">digitali</span>
                <br />
                senza confini
              </h1>
              
              {/* Sharp value proposition */}
              <p className="text-xl md:text-2xl text-[#6B5D4F]/80 font-light max-w-xl leading-relaxed">
                Sviluppatore full-stack: interfacce curate,
                ispirate da culture e connessioni in tutto il mondo.
              </p>
            </div>

            {/* Minimal CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="#projects" 
                className="group px-7 py-3.5 bg-[#2C2416] text-[#FAF9F6] hover:bg-[#3D3122] transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <span className="font-normal tracking-wide">Vedi progetti</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#contact" 
                className="px-7 py-3.5 border border-[#6B5D4F]/30 text-[#2C2416] hover:border-[#6B5D4F] hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                <span className="font-normal tracking-wide">Scrivimi</span>
              </a>
            </div>

            {/* Refined social links */}
            <div className="flex gap-3 pt-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 border border-[#6B5D4F]/20 hover:border-[#6B5D4F]/40 text-[#6B5D4F] hover:text-[#2C2416] transition-all duration-300 bg-white/30 backdrop-blur-sm"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 border border-[#6B5D4F]/20 hover:border-[#6B5D4F]/40 text-[#6B5D4F] hover:text-[#2C2416] transition-all duration-300 bg-white/30 backdrop-blur-sm"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="mailto:damiano.francesco@example.com"
                className="p-2.5 border border-[#6B5D4F]/20 hover:border-[#6B5D4F]/40 text-[#6B5D4F] hover:text-[#2C2416] transition-all duration-300 bg-white/30 backdrop-blur-sm"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right side - generous negative space with subtle element */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative h-[400px]">
              {/* Abstract minimal element suggesting movement */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 border border-[#D4A574]/20 rotate-12 transition-transform duration-700 hover:rotate-6"></div>
                  <div className="absolute inset-8 border border-[#8B9DAF]/20 -rotate-6 transition-transform duration-700 hover:rotate-0"></div>
                  <div className="absolute inset-16 bg-gradient-to-br from-[#D4A574]/5 to-[#8B9DAF]/5 backdrop-blur-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal scroll indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-[#6B5D4F]/60">
          <span className="text-xs tracking-wider uppercase">Esplora</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </section>
  );
}
