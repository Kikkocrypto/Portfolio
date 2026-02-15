import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import { ScrollReveal } from '../../components/motion';
import { STAGGER } from '../../constants/motion';

export function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert(t('contact.submitSuccess'));
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    { icon: Mail, label: t('contact.emailLabel'), value: 'damianofrancesco71@gmail.com', link: 'mailto:damianofrancesco71@gmail.com' },
    { icon: Phone, label: t('contact.phoneLabel'), value: '+39 329 242 3053', link: 'tel:+39329242305' },
    { icon: MapPin, label: t('contact.whereLabel'), value: 'Canosa di Puglia, Italia', link: null }
  ];

  return (
    <section id="contact" className="py-24 md:py-32 bg-gradient-to-br from-[#2C2416] via-[#3D3122] to-[#2C2416] text-[#FAF9F6] relative overflow-hidden">
      {/* Subtle atmospheric elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-gradient-radial from-[#D4A574]/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full bg-gradient-radial from-[#8B9DAF]/8 to-transparent blur-3xl"></div>

      {/* Texture */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-16 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="mb-20 max-w-3xl">
              <div className="inline-block h-px w-16 bg-[#D4A574] mb-6"></div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight">
                {t('contact.title')}
              </h2>
              <p className="text-xl md:text-2xl text-[#FAF9F6]/70 font-light leading-relaxed">
                {t('contact.subtitle')}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-5">
              <ScrollReveal delay={100}>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-light mb-8 tracking-wide">{t('contact.contactsTitle')}</h3>
                    <div className="space-y-6">
                      {contactInfo.map((info, idx) => {
                        const Icon = info.icon;
                        const content = (
                          <div className="flex items-start gap-4 p-5 border border-[#FAF9F6]/10 hover:border-[#FAF9F6]/20 transition-all duration-500 bg-white/5 backdrop-blur-sm hover-lift">
                            <div className="w-10 h-10 border border-[#D4A574]/30 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4 text-[#D4A574]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-[#FAF9F6]/50 mb-1 tracking-wide">{info.label}</p>
                              <p className="text-[#FAF9F6] break-words">{info.value}</p>
                            </div>
                          </div>
                        );

                        return info.link ? (
                          <a key={idx} href={info.link} className="block">
                            {content}
                          </a>
                        ) : (
                          <div key={idx}>{content}</div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border border-[#FAF9F6]/10 p-8 bg-white/5 backdrop-blur-sm hover:border-[#FAF9F6]/20 transition-all duration-500">
                    <h4 className="font-normal mb-3 text-[#D4A574] tracking-wide">{t('contact.availability')}</h4>
                    <p className="text-[#FAF9F6]/70 leading-relaxed">
                      {t('contact.availabilityText')}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={200}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-normal mb-3 tracking-wide text-[#FAF9F6]/70">
                      {t('contact.formName')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-white/5 border border-[#FAF9F6]/10 text-[#FAF9F6] focus:border-[#D4A574]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/20 transition-all backdrop-blur-sm placeholder:text-[#FAF9F6]/30"
                      placeholder={t('contact.placeholderName')}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-normal mb-3 tracking-wide text-[#FAF9F6]/70">
                      {t('contact.formEmail')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-white/5 border border-[#FAF9F6]/10 text-[#FAF9F6] focus:border-[#D4A574]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/20 transition-all backdrop-blur-sm placeholder:text-[#FAF9F6]/30"
                      placeholder={t('contact.placeholderEmail')}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-normal mb-3 tracking-wide text-[#FAF9F6]/70">
                      {t('contact.formMessage')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-5 py-4 bg-white/5 border border-[#FAF9F6]/10 text-[#FAF9F6] focus:border-[#D4A574]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/20 transition-all resize-none backdrop-blur-sm placeholder:text-[#FAF9F6]/30"
                      placeholder={t('contact.placeholderMessage')}
                    />
                  </div>

                  <button
                    type="submit"
                    className="group w-full px-7 py-4 bg-[#FAF9F6] text-[#2C2416] hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover-lift"
                  >
                    <span className="font-normal tracking-wide">{t('contact.submit')}</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </form>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
