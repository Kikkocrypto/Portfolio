import { useState } from 'react';
import { Code, Zap, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '../../components/motion';
import { STAGGER, DURATION } from '../../constants/motion';

type BoxView = 'esperienza' | 'formazione';

const timelineItems: { year: string; label: string; detail?: string }[] = [
  { year: '2019', label: 'Diploma', detail: 'Diploma di istruzione tecnica, indirizzo chimica e biologia.' },
  { year: '2020', label: 'Lavori precari', detail: 'Lavori precari come aiuto cuoco e in un calzaturificio.' },
  { year: '2021', label: 'Lavori precari · Blockchain', detail: 'Proseguono le esperienze come aiuto cuoco e in calzaturificio. Approfondimento della tecnologia Blockchain.' },
  { year: '2022', label: 'Percorso ufficiale · primi veri passi in SEO e Informatica', detail: 'Inizio del percorso ufficiale: certificazioni SEO e ruolo da community manager per i server Discord. Approfondimento degli smart contracts e dell\'informatica.' },
  { year: '2023', label: 'Partenza seria · Uni Pegaso e corso Full Stack Bit Spa', detail: 'Anno della mia partenza seria nell\'informatica: iscrizione all\'Università Pegaso (Informatica per le aziende digitali) e corso Full Stack presso Bit Spa con focus sulle seguenti Tecnologie: Spring Boot, Kubernetes, Docker, Angular.' },
  { year: '2024', label: 'Opentusk Hackathon (Dic 2024)', detail: 'Collaborato con un team per sviluppare un MVP in 10 ore, affrontando problemi e tempistiche ristrette. Sviluppo di un bot Telegram per la registrazione istantanea ad eventi in zona. Tecnologie: Telegram Bot API (RESTful), Python, BotFather.' },
  { year: '2025', label: 'Erasmus Brașov (Feb-Giu) · Sviluppatore Full-Stack LML', detail: 'Cinque mesi a Brașov, tra i Carpazi: l\'Erasmus che mi ha cambiato la vita. Corsi di Ingegneria del software e Programmazione (C++, Java, .NET, C#), ma soprattutto persone, viaggi e quella spinta a crescere che non avevo mai sentito prima. Soft e hard skill che porto ancora con me. Da Settembre: Sviluppatore Full-Stack presso LML technologies.' },
  { year: '2026', label: 'In corso', detail: 'Completamento percorso universitario e voglia di crescere internazionalmente.' },
];

export function About() {
  const [boxView, setBoxView] = useState<BoxView>('esperienza');
  const [openTimelineIndex, setOpenTimelineIndex] = useState<number | null>(null);

  const formazione = {
    title: 'Formazione',
    items: [
      {
        title: 'Laurea in Informatica per le aziende digitali',
        subtitle: 'Università telematica Pegaso',
        period: '2023 - 2026',
      },
      {
        title: 'Tesi',
        subtitle: "Sviluppo di un'applicazione full-stack per la gestione di cliniche private",
        note: '110/110 con lode',
      },
    ],
  };

  const esperienza = {
    title: 'Esperienza tecnica',
    items: [
      {
        title: 'Sviluppatore Full-Stack',
        azienda: 'LML technologies SRL',
        subtitle: 'Progetti AI driven',
        period: '2025 - In corso',
      },
      {
        title: 'Descrizione',
        content: 'Sviluppo di applicazioni web full-stack, interfacce curate e soluzioni su misura per il settore AI, seguendo metodologia agile e sviluppo top-bottom.',
      },
    ],
  };

  const cycleView = (direction: 'prev' | 'next') => {
    setBoxView((current) => {
      if (direction === 'next') return current === 'formazione' ? 'esperienza' : 'formazione';
      return current === 'esperienza' ? 'formazione' : 'esperienza';
    });
  };

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
      icon: Rocket,
      title: 'Velocità e lancio sicuro',
      description: 'Sviluppo rapido con agenti AI e rilascio di soluzioni sicure in tempi brevi, senza compromettere qualità e protezione dei dati.'
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
          <ScrollReveal>
            <div className="mb-20 max-w-3xl">
              <div className="inline-block h-px w-16 bg-[#D4A574] mb-6"></div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#2C2416] mb-6 leading-tight">
                Chi sono
              </h2>
              <p className="text-xl md:text-2xl text-[#6B5D4F]/70 font-light leading-relaxed">
                Prodotti digitali con un respiro internazionale
              </p>
            </div>
          </ScrollReveal>

          {/* Content - asymmetrical grid */}
          <ScrollReveal delay={100}>
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
                <div className="bg-[#FAF9F6] p-8 border border-[#D4A574]/10 shadow-sm hover:shadow-md hover:border-[#D4A574]/20 transition-all duration-500">
                  {/* Intestazione con frecce: Esperienza | Formazione */}
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => cycleView('prev')}
                      className="p-2 cursor-pointer text-[#6B5D4F]/60 hover:text-[#2C2416] hover:bg-white/50 rounded transition-colors duration-300"
                      aria-label={boxView === 'esperienza' ? 'Vedi formazione' : 'Vedi esperienza'}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-normal text-[#2C2416]">
                      {boxView === 'formazione' ? formazione.title : esperienza.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => cycleView('next')}
                      className="p-2 cursor-pointer text-[#6B5D4F]/60 hover:text-[#2C2416] hover:bg-white/50 rounded transition-colors duration-300"
                      aria-label={boxView === 'formazione' ? 'Vedi esperienza' : 'Vedi formazione'}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Contenuto: una sola vista alla volta */}
                  <div className="min-h-[140px] relative">
                    {boxView === 'formazione' && (
                      <div
                        key="formazione"
                        className="space-y-6 animate-fade-in"
                        style={{ animationDuration: `${DURATION.fast}ms` }}
                      >
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-1.5 h-1.5 bg-[#D4A574] rounded-full mt-2 flex-shrink-0" />
                            <div>
                              <h4 className="font-normal text-[#2C2416]">{formazione.items[0].title}</h4>
                              <p className="text-[#6B5D4F]/70 text-sm">{formazione.items[0].subtitle}</p>
                              <p className="text-sm text-[#6B5D4F]/60 mt-1">{formazione.items[0].period}</p>
                            </div>
                          </div>
                        </div>
                        <div className="pt-6 border-t border-[#D4A574]/10">
                          <h4 className="font-normal text-[#2C2416] mb-2">{formazione.items[1].title}</h4>
                          <p className="text-[#6B5D4F]/70 text-sm leading-relaxed">{formazione.items[1].subtitle}</p>
                          <p className="text-sm text-[#D4A574] mt-2">{formazione.items[1].note}</p>
                        </div>
                      </div>
                    )}
                    {boxView === 'esperienza' && (
                      <div
                        key="esperienza"
                        className="space-y-6 animate-fade-in"
                        style={{ animationDuration: `${DURATION.fast}ms` }}
                      >
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-1.5 h-1.5 bg-[#D4A574] rounded-full mt-2 flex-shrink-0" />
                            <div>
                              <h4 className="font-normal text-[#2C2416]">{esperienza.items[0].title}</h4>
                              {esperienza.items[0].azienda && (
                                <p className="text-[#6B5D4F] text-sm font-medium tracking-wide mt-0.5">{esperienza.items[0].azienda}</p>
                              )}
                              <p className="text-[#6B5D4F]/70 text-sm">{esperienza.items[0].subtitle}</p>
                              <p className="text-sm text-[#6B5D4F]/60 mt-1">{esperienza.items[0].period}</p>
                            </div>
                          </div>
                        </div>
                        <div className="pt-6 border-t border-[#D4A574]/10">
                          <h4 className="font-normal text-[#2C2416] mb-2">{esperienza.items[1].title}</h4>
                          <p className="text-[#6B5D4F]/70 text-sm leading-relaxed">{esperienza.items[1].content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Timeline a ramo: full width pagina, voci alternate sinistra/destra */}
          <ScrollReveal delay={150}>
            <div className="mb-20 w-full">
              <div className="inline-block h-px w-16 bg-[#D4A574] mb-6" />
              <h3 className="text-3xl md:text-4xl font-light text-[#2C2416] mb-2 tracking-tight">
                Il mio percorso
              </h3>
              <p className="text-lg text-[#6B5D4F]/70 font-light mb-2 max-w-2xl">
                Dal diploma a oggi.
              </p>
              <p className="text-sm text-[#6B5D4F]/45 font-light mb-10 max-w-2xl" aria-hidden>
                Clicca sui pallini per i dettagli
              </p>

              {/* Mobile: timeline verticale semplice */}
              <div className="w-full lg:hidden">
                <div className="flex gap-4 items-stretch">
                  <div className="relative w-5 shrink-0">
                    <div className="absolute left-1/2 top-5 bottom-5 -translate-x-1/2 bg-[#D4A574]/25 timeline-line-v" style={{ width: '0.5px' }} aria-hidden />
                  </div>
                  <div className="flex flex-col flex-1 -ml-5">
                    {timelineItems.map((item, index) => (
                      <ScrollReveal key={item.year} delay={80 + index * STAGGER.compact}>
                        <div className="flex flex-col gap-0">
                          <div className="flex gap-8 items-start">
                            <button
                              type="button"
                              onClick={() => setOpenTimelineIndex((i) => (i === index ? null : index))}
                              className={`w-5 h-5 rounded-full relative z-10 shrink-0 mt-0.5 timeline-dot timeline-dot-hint animate-scale-in transition-transform duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer ${item.year === '2023' ? 'bg-[#E6B800] focus-visible:ring-[#E6B800]/50 timeline-dot-milestone' : item.year === '2025' ? 'timeline-dot-romania focus-visible:ring-[#CE1126]/50 timeline-dot-erasmus' : 'bg-[#D4A574] focus-visible:ring-[#D4A574]/50'}`}
                              style={{ animationDuration: `${DURATION.fast}ms`, animationFillMode: 'both' }}
                              aria-expanded={openTimelineIndex === index}
                              aria-label={openTimelineIndex === index ? 'Chiudi dettaglio' : `Dettaglio ${item.year}${item.year === '2023' ? ' — Partenza seria nell\'informatica' : item.year === '2025' ? ' — Erasmus, esperienza che mi ha cambiato la vita' : ''}`}
                            />
                            <div className="pb-2 min-w-0 max-w-sm flex-1">
                              <span className="text-sm font-medium text-[#2C2416]">{item.year}</span>
                              <p className="text-sm text-[#6B5D4F]/80 mt-0.5">{item.label}</p>
                            </div>
                          </div>
                          {item.detail && openTimelineIndex === index && (
                            <div className="ml-12 mt-3 mb-4 py-2 px-3 border-l border-[#D4A574]/20 bg-[#FAF9F6]/60 text-[#6B5D4F]/90 text-xs leading-relaxed max-w-md transition-opacity duration-200">
                              {item.detail}
                            </div>
                          )}
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop: timeline a ramo, larghezza limitata e linee più corte */}
              <div className="hidden lg:block w-full max-w-4xl mx-auto">
                <div className="relative w-full">
                  {/* Linea verticale centrale (sottile) */}
                  <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 bg-[#D4A574]/25 timeline-line-v" style={{ width: '0.5px' }} aria-hidden />
                  {timelineItems.map((item, index) => {
                    const isLeft = index % 2 === 0;
                    const isOpen = openTimelineIndex === index;
                    return (
                      <ScrollReveal key={item.year} delay={80 + index * STAGGER.compact}>
                        <div className="w-full">
                          <div className="grid grid-cols-[1fr_auto_1fr] gap-0 w-full items-center min-h-[4rem] py-1">
                            {/* Ramo sinistro: contenuto più a sinistra, linea verso il centro */}
                            <div className="flex items-center justify-start min-w-0">
                              {isLeft ? (
                                <>
                                  <div className="text-right w-full max-w-sm pr-8 shrink-0">
                                    <span className="text-sm font-medium text-[#2C2416]">{item.year}</span>
                                    <p className="text-sm text-[#6B5D4F]/80 mt-0.5">{item.label}</p>
                                  </div>
                                  <div className="flex-1 min-w-4 shrink-0 bg-[#D4A574]/25" style={{ height: '0.5px' }} aria-hidden />
                                </>
                              ) : null}
                            </div>
                            {/* Centro: pallino cliccabile */}
                            <div className="flex justify-center shrink-0 w-5">
                              <button
                                type="button"
                                onClick={() => setOpenTimelineIndex((i) => (i === index ? null : index))}
                                className={`w-5 h-5 rounded-full relative z-10 timeline-dot timeline-dot-hint animate-scale-in transition-transform duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer ${item.year === '2023' ? 'bg-[#E6B800] focus-visible:ring-[#E6B800]/50 timeline-dot-milestone' : item.year === '2025' ? 'timeline-dot-romania focus-visible:ring-[#CE1126]/50 timeline-dot-erasmus' : 'bg-[#D4A574] focus-visible:ring-[#D4A574]/50'}`}
                                style={{ animationDuration: `${DURATION.fast}ms`, animationFillMode: 'both' }}
                                aria-expanded={isOpen}
                                aria-label={isOpen ? 'Chiudi dettaglio' : `Dettaglio ${item.year}${item.year === '2023' ? ' — Partenza seria nell\'informatica' : item.year === '2025' ? ' — Erasmus, esperienza che mi ha cambiato la vita' : ''}`}
                              />
                            </div>
                            {/* Ramo destro: linea dal centro, contenuto più a destra */}
                            <div className="flex items-center justify-end min-w-0">
                              {!isLeft ? (
                                <>
                                  <div className="flex-1 min-w-4 shrink-0 bg-[#D4A574]/25" style={{ height: '0.5px' }} aria-hidden />
                                  <div className="text-left w-full max-w-sm pl-8 shrink-0">
                                    <span className="text-sm font-medium text-[#2C2416]">{item.year}</span>
                                    <p className="text-sm text-[#6B5D4F]/80 mt-0.5">{item.label}</p>
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </div>
                          {/* Dettaglio aperto: piccola sezione sotto la riga */}
                          {item.detail && isOpen && (
                            <div className="flex justify-center mt-4 mb-2">
                              <p className="text-xs text-[#6B5D4F]/80 leading-relaxed max-w-md text-center px-4 py-2 border border-[#D4A574]/15 bg-[#FAF9F6]/50 rounded-sm">
                                {item.detail}
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Chi sono – parte bassa: punti di forza */}
          <div className="mt-20 md:mt-24">
            <div className="inline-block h-px w-16 bg-[#D4A574] mb-6" />
            <h3 className="text-3xl md:text-4xl font-light text-[#2C2416] mb-2 tracking-tight">
              Cosa mi contraddistingue
            </h3>
            <p className="text-lg text-[#6B5D4F]/70 font-light mb-10 max-w-2xl">
              I valori che guido nel mio lavoro quotidiano.
            </p>
            <div className="grid md:grid-cols-3 gap-8 md:items-stretch">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={index} delay={200 + index * STAGGER.comfortable} className="h-full">
                  <div className="group h-full flex flex-col p-8 border border-[#D4A574]/10 hover:border-[#D4A574]/30 transition-all duration-500 bg-white hover:shadow-sm hover-lift">
                    <div className="w-12 h-12 border border-[#D4A574]/20 flex items-center justify-center mb-6 group-hover:border-[#D4A574]/40 transition-colors duration-500 shrink-0">
                      <Icon className="w-6 h-6 text-[#6B5D4F] group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h3 className="text-xl font-normal text-[#2C2416] mb-3 shrink-0">{item.title}</h3>
                    <p className="text-[#6B5D4F]/70 leading-relaxed flex-1 min-h-0">{item.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
