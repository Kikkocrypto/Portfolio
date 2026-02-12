import { Code, Palette, Zap } from 'lucide-react';

export function About() {
  const highlights = [
    {
      icon: Code,
      title: 'Codice curato',
      description: 'Soluzioni scalabili e manutenibili, pensate per avere impatto nel lungo periodo.'
    },
    {
      icon: Zap,
      title: 'Sicurezza',
      description: 'Protezione dei dati e delle informazioni sono il mio focus principale.'
    },
    {
      icon: Palette,
      title: 'Design thinking',
      description: 'Design thinking per mettere l\'utente al centro della nostra attenzione.'
    }
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-white relative">
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-16 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header with asymmetry */}
          <div className="mb-20 max-w-3xl">
            <div className="inline-block h-px w-16 bg-[#D4A574] mb-6"></div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#2C2416] mb-6 leading-tight">
              Chi sono
            </h2>
            <p className="text-xl md:text-2xl text-[#6B5D4F]/70 font-light leading-relaxed">
              Prodotti digitali con un respiro internazionale
            </p>
          </div>

          {/* Content - asymmetrical grid */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
            <div className="lg:col-span-7 space-y-6 text-lg text-[#3D3122]/80 leading-relaxed font-light">
              <p>
                Mi chiamo Damiano Francesco e sono uno <strong className="font-normal text-[#2C2416]">sviluppatore full-stack</strong> con 
                la passione per esperienze digitali e relazioni interpersonali. Il mio percorso nell'informatica si intreccia 
                con viaggi e esplorazione culturale: ogni luogo mi insegna a guardare i problemi 
                da angolazioni diverse, con una mentalità aperta e curiosa.
              </p>
              <p>
                Preferisco avere sempre un approccio analitico con un tocco di creatività per affrontare le sfide. Cercando sempre di migliorare sia me che i miei progetti.
              </p>
              <p>
                Quando non mi occupo di sviluppare applicazioni full-stack, mi trovo ad esplorare il mondo e a creare nuove connessioni internazionali.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[#FAF9F6] p-8 border border-[#D4A574]/10 shadow-sm">
                <h3 className="text-xl font-normal text-[#2C2416] mb-6">Formazione</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-1.5 h-1.5 bg-[#D4A574] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-normal text-[#2C2416]">Laurea in Informatica per le aziende digitali</h4>
                        <p className="text-[#6B5D4F]/70 text-sm">Università telematica Pegaso</p>
                        <p className="text-sm text-[#6B5D4F]/60 mt-1">2023 - 2026</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[#D4A574]/10">
                    <h4 className="font-normal text-[#2C2416] mb-2">Tesi</h4>
                    <p className="text-[#6B5D4F]/70 text-sm leading-relaxed">
                      "Sviluppo di un'applicazione full-stack per la gestione di cliniche private"
                    </p>
                    <p className="text-sm text-[#D4A574] mt-2">110/110 con lode</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights - refined cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="group p-8 border border-[#D4A574]/10 hover:border-[#D4A574]/30 transition-all duration-500 bg-white hover:shadow-sm"
                >
                  <div className="w-12 h-12 border border-[#D4A574]/20 flex items-center justify-center mb-6 group-hover:border-[#D4A574]/40 transition-colors">
                    <Icon className="w-6 h-6 text-[#6B5D4F]" />
                  </div>
                  <h3 className="text-xl font-normal text-[#2C2416] mb-3">{item.title}</h3>
                  <p className="text-[#6B5D4F]/70 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
