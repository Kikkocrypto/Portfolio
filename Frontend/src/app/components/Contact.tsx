import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thanks for reaching out! I will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'damianofrancesco71@gmail.com',
      link: 'mailto:damianofrancesco71@gmail.com'
    },
    {
      icon: Phone,
      label: 'Telefono',
      value: '+39 329 242 3053',
      link: 'tel:+39329242305'
    },
    {
      icon: MapPin,
      label: 'Dove sono',
      value: 'Canosa di Puglia, Italia',
      link: null
    }
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
          <div className="mb-20 max-w-3xl">
            <div className="inline-block h-px w-16 bg-[#D4A574] mb-6"></div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight">
              Mettiamoci in contatto
            </h2>
            <p className="text-xl md:text-2xl text-[#FAF9F6]/70 font-light leading-relaxed">
              Hai un progetto in mente o vuoi solo chiacchierare? Scrivimi.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h3 className="text-2xl font-light mb-8 tracking-wide">Contatti</h3>
                <div className="space-y-6">
                  {contactInfo.map((info, idx) => {
                    const Icon = info.icon;
                    const content = (
                      <div className="flex items-start gap-4 p-5 border border-[#FAF9F6]/10 hover:border-[#FAF9F6]/20 transition-colors bg-white/5 backdrop-blur-sm">
                        <div className="w-10 h-10 border border-[#D4A574]/30 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-[#D4A574]" />
                        </div>
                        <div>
                          <p className="text-sm text-[#FAF9F6]/50 mb-1 tracking-wide">{info.label}</p>
                          <p className="text-[#FAF9F6]">{info.value}</p>
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

              <div className="border border-[#FAF9F6]/10 p-8 bg-white/5 backdrop-blur-sm">
                <h4 className="font-normal mb-3 text-[#D4A574] tracking-wide">Disponibilità</h4>
                <p className="text-[#FAF9F6]/70 leading-relaxed">
                  Aperto a opportunità full-time, progetti in freelance e collaborazioni. 
                  Tempo di risposta: 24-48 ore.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-normal mb-3 tracking-wide text-[#FAF9F6]/70">
                    Nome e cognome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-white/5 border border-[#FAF9F6]/10 text-[#FAF9F6] focus:border-[#D4A574]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/20 transition-all backdrop-blur-sm placeholder:text-[#FAF9F6]/30"
                    placeholder="Il tuo nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-normal mb-3 tracking-wide text-[#FAF9F6]/70">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-white/5 border border-[#FAF9F6]/10 text-[#FAF9F6] focus:border-[#D4A574]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/20 transition-all backdrop-blur-sm placeholder:text-[#FAF9F6]/30"
                    placeholder="latuaemail@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-normal mb-3 tracking-wide text-[#FAF9F6]/70">
                    Messaggio
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-5 py-4 bg-white/5 border border-[#FAF9F6]/10 text-[#FAF9F6] focus:border-[#D4A574]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/20 transition-all resize-none backdrop-blur-sm placeholder:text-[#FAF9F6]/30"
                    placeholder="Dimmi qualcosa..."
                  />
                </div>

                <button
                  type="submit"
                  className="group w-full px-7 py-4 bg-[#FAF9F6] text-[#2C2416] hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <span className="font-normal tracking-wide">Invia messaggio</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
