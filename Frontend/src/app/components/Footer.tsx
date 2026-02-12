import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#2C2416] text-[#FAF9F6]/60 py-16 border-t border-[#FAF9F6]/5 relative">
      {/* Texture */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-16 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-[#FAF9F6] font-light text-2xl mb-4 tracking-wide">Damiano Francesco</h3>
              <p className="text-[#FAF9F6]/50 leading-relaxed">
                Sviluppatore full-stack: esperienze digitali curate, ispirate da viaggi e prospettive globali.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[#FAF9F6] font-normal mb-6 tracking-wide">Naviga</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#about" className="text-[#FAF9F6]/60 hover:text-[#D4A574] transition-colors tracking-wide">
                    Chi sono
                  </a>
                </li>
                <li>
                  <a href="#skills" className="text-[#FAF9F6]/60 hover:text-[#D4A574] transition-colors tracking-wide">
                    Competenze
                  </a>
                </li>
                <li>
                  <a href="#projects" className="text-[#FAF9F6]/60 hover:text-[#D4A574] transition-colors tracking-wide">
                    Progetti
                  </a>
                </li>
                <li>
                  <a href="#blog" className="text-[#FAF9F6]/60 hover:text-[#D4A574] transition-colors tracking-wide">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-[#FAF9F6]/60 hover:text-[#D4A574] transition-colors tracking-wide">
                    Contatti
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-[#FAF9F6] font-normal mb-6 tracking-wide">Connect</h4>
              <div className="flex gap-3">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-11 h-11 border border-[#FAF9F6]/10 hover:border-[#D4A574]/40 flex items-center justify-center transition-all hover:bg-white/5"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5 text-[#FAF9F6]/60" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-11 h-11 border border-[#FAF9F6]/10 hover:border-[#D4A574]/40 flex items-center justify-center transition-all hover:bg-white/5"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-[#FAF9F6]/60" />
                </a>
                <a 
                  href="mailto:damiano.francesco@example.com"
                  className="w-11 h-11 border border-[#FAF9F6]/10 hover:border-[#D4A574]/40 flex items-center justify-center transition-all hover:bg-white/5"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5 text-[#FAF9F6]/60" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-[#FAF9F6]/5 text-center">
            <p className="text-sm text-[#FAF9F6]/40 tracking-wide">
              © {new Date().getFullYear()} Damiano Francesco. Realizzato con cura.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
