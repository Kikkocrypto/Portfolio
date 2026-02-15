import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isTop, setIsTop] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { labelKey: 'header.nav.about', href: '#about' },
    { labelKey: 'header.nav.skills', href: '#skills' },
    { labelKey: 'header.nav.projects', href: '#projects' },
    { labelKey: 'header.nav.blog', href: '#blog' },
    { labelKey: 'header.nav.contact', href: '#contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsTop(currentScrollY < 50);
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsMobileMenuOpen(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);

    if (href === '#') {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (location.pathname !== '/') {
      navigate(`/${href}`);
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isTop 
          ? 'bg-[#FAF9F6]/0' 
          : 'bg-[#FAF9F6]/95 backdrop-blur-md shadow-sm border-b border-[#D4A574]/10'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('#')}
            className={`font-light text-xl tracking-wider transition-all duration-300 ${
              isTop ? 'text-[#2C2416]' : 'text-[#2C2416]'
            } hover:text-[#6B5D4F]`}
          >
            DF
          </button>

          {/* Desktop Navigation + Language switcher */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8">
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavClick(item.href)}
                  className={`text-sm tracking-wider transition-all duration-300 relative group ${
                    isTop ? 'text-[#2C2416]' : 'text-[#2C2416]'
                  } hover:text-[#6B5D4F]`}
                >
                  {t(item.labelKey)}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-[#D4A574] group-hover:w-full transition-all duration-300 ease-out"></span>
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-1 border-l border-[#D4A574]/20 pl-6">
              <button
                onClick={() => i18n.changeLanguage('it')}
                className={`px-2 py-1 text-sm tracking-wider transition-colors ${i18n.language === 'it' ? 'text-[#2C2416] font-medium' : 'text-[#6B5D4F]/70 hover:text-[#6B5D4F]'}`}
                aria-label="Italiano"
              >
                IT
              </button>
              <span className="text-[#6B5D4F]/40">|</span>
              <button
                onClick={() => i18n.changeLanguage('en')}
                className={`px-2 py-1 text-sm tracking-wider transition-colors ${i18n.language === 'en' ? 'text-[#2C2416] font-medium' : 'text-[#6B5D4F]/70 hover:text-[#6B5D4F]'}`}
                aria-label="English"
              >
                EN
              </button>
              <span className="text-[#6B5D4F]/40">|</span>
              <button
                onClick={() => i18n.changeLanguage('es')}
                className={`px-2 py-1 text-sm tracking-wider transition-colors ${i18n.language === 'es' ? 'text-[#2C2416] font-medium' : 'text-[#6B5D4F]/70 hover:text-[#6B5D4F]'}`}
                aria-label="Español"
              >
                ES
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-all duration-300 ${
              isTop ? 'text-[#2C2416]' : 'text-[#2C2416]'
            } hover:text-[#6B5D4F]`}
            aria-label={t('header.menuAria')}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden transition-all duration-300 ease-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="bg-[#FAF9F6] border-t border-[#D4A574]/10 backdrop-blur-md">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(item.href)}
              className="block w-full text-left px-6 py-4 text-[#2C2416] hover:text-[#6B5D4F] hover:bg-white/50 transition-all duration-300 tracking-wider text-sm border-b border-[#D4A574]/5 last:border-b-0"
            >
              {t(item.labelKey)}
            </button>
          ))}
          <div className="flex items-center gap-4 px-6 py-4 border-t border-[#D4A574]/10">
            <span className="text-xs text-[#6B5D4F]/60 tracking-wider uppercase">Idioma</span>
            <button
              onClick={() => { i18n.changeLanguage('it'); setIsMobileMenuOpen(false); }}
              className={`px-3 py-1.5 text-sm ${i18n.language === 'it' ? 'text-[#2C2416] font-medium bg-white/50' : 'text-[#6B5D4F]'}`}
            >
              IT
            </button>
            <button
              onClick={() => { i18n.changeLanguage('en'); setIsMobileMenuOpen(false); }}
              className={`px-3 py-1.5 text-sm ${i18n.language === 'en' ? 'text-[#2C2416] font-medium bg-white/50' : 'text-[#6B5D4F]'}`}
            >
              EN
            </button>
            <button
              onClick={() => { i18n.changeLanguage('es'); setIsMobileMenuOpen(false); }}
              className={`px-3 py-1.5 text-sm ${i18n.language === 'es' ? 'text-[#2C2416] font-medium bg-white/50' : 'text-[#6B5D4F]'}`}
            >
              ES
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
