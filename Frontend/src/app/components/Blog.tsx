import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '../../components/motion';
import { STAGGER } from '../../constants/motion';

interface Post {
  id: number;
  title: string;
  excerpt: string;
  reflection: string;
  location: string;
  date: string;
  readTime: string;
}

export function Blog() {
  const { t } = useTranslation();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const postsRaw = t('blog.posts', { returnObjects: true }) as { title: string; excerpt: string; reflection: string; location: string; date: string; readTime: string }[];
  const posts: Post[] = postsRaw.map((p, i) => ({ ...p, id: i + 1 }));

  const _removed = [
    {
      id: 1,
      title: '',
      excerpt: 'Riconoscimento di pattern, immersione e i parallelismi inaspettati tra JavaScript e l\'italiano parlato a Roma.',
      reflection: `L\'estate scorsa ho passato tre settimane a Roma. Non in un’aula, ma tra mercati, bar e vicoli: imparando l’italiano come si fa quando non hai scelta e devi parlarlo. All’inizio ogni frase suonava goffa. Poi, a poco a poco, sono emersi i pattern. Il ritmo per chiedere indicazioni. La cadenza per ordinare un caffè. Le piccole vittorie quando capivi ed eri capito.

Imparare a programmare mi è sembrato molto simile.

Quando ho iniziato con JavaScript, cercavo di memorizzare la sintassi. Leggevo la documentazione come un manuale. Ma la vera fluidità è arrivata quando ho smesso di “tradurre” in testa e ho iniziato a pensare in codice. Quando ho smesso di chiedermi “come si dice questo?” e ho iniziato a riconoscere i pattern che avevo già visto.

A Roma ho imparato che le preposizioni cambiano senso con il contesto. “A Roma” è “in Rome”, “di Roma” è “from Rome”. Sottile, ma decisivo. In React ho imparato che prop e state contengono entrambi dati, ma è il contesto a determinare come li usi. Non si tratta di memorizzare regole, ma di sviluppare intuizione con la ripetizione.

I migliori insegnanti di lingue non si fermano alle tabelle di grammatica. Ti immergono nella conversazione, ti lasciano sbagliare, correggono con delicatezza. Il modo migliore in cui ho imparato React non sono stati i tutorial, ma costruire prototipi caotici, rompere le cose e capire piano piano perché si rompevano.

C’è un momento, quando impari una lingua, in cui smetti di tradurre. Senti “buongiorno” e sai che è mattina, senti che è un saluto, capisci il calore della parola senza pensarci. È il momento in cui sei fluente.

Con il codice succede lo stesso. Un giorno guardi un componente e ne vedi la struttura. Sai dove vive lo state, come scorrono i dati, cosa si rompe se cambi qualcosa. Non stai più leggendo parole in inglese: stai leggendo logica, ritmo, intenzione.

Faccio ancora fatica con il congiuntivo in italiano. Mi confondo ancora con i generics avanzati di TypeScript. Ma il processo è lo stesso: immersione, riconoscimento di pattern, errori e riprovare. Entrambi richiedono di stare bene nel non sapere, nel sembrare goffo, nel chiedere aiuto.

Gli sviluppatori che ammiro di più non sono quelli che si sono memorizzati ogni API. Sono quelli che hanno imparato a pensare per sistemi, a riconoscere pattern tra linguaggi, ad adattare ciò che sanno a contesti nuovi. Come i migliori viaggiatori non sono quelli che memorizzano i phrase book: sono quelli che ascoltano, si adattano e restano curiosi.

Ogni lingua—parlata o di programmazione—è uno strumento per connettersi. Per esprimere idee, costruire cose, collaborare. E come ogni lingua, diventa più facile quanto più la usi in contesti reali, non sui libri.

Se stai imparando a programmare e ti senti perso, ricorda: non stai memorizzando un dizionario. Stai imparando ad avere una conversazione. Abbi pazienza. Sbaglia. Continua a costruire. Un giorno ti accorgerai che stai pensando in codice senza nemmeno rendertene conto.

Come un giorno, in un piccolo bar a Trastevere, ho ordinato un caffè in italiano senza pensarci su.`,
      location: 'Scritto a Roma',
      date: '15 gen 2024',
      readTime: '6 min'
    },
    {
      id: 2,
      title: 'Il test del bar',
      excerpt: 'Perché valuto il mio lavoro chiedendomi se lo userei in un bar rumoroso, con wifi instabile e batteria scarica.',
      reflection: `Faccio le mie migliori riflessioni al bar. Non in spazi di co-working trendy o in biblioteche silenziose, ma in bar veri, imperfetti: macchine del caffè che sibilano, baristi che urlano le ordinazioni, wifi che va e viene, batteria del portatile sempre al 12%.

Questi posti mi hanno insegnato più sullo sviluppo software di qualsiasi corso.

Perché il bar è il peggior ambiente per usare un’app—e quindi il migliore per testarla. Se funziona lì, funziona ovunque.

Wifi lento? I tuoi utenti ce l’hanno. Batteria scarica? Sicuro. Connessione che cade ogni tre minuti? Sempre. Schermo sporco che non si vede con il sole dalla finestra? Tutti i giorni.

Ero in un bar a Lisbona, cercando di prenotare un biglietto del treno dal telefono. L’app andava in timeout. Ogni tentativo significava reinserire i dati di pagamento. La pagina caricava lentamente. Le immagini erano enormi. L’interfaccia dava per scontata una connessione perfetta e pazienza infinita. Ho mollato e sono andato a piedi in stazione.

Quel momento ha cambiato il modo in cui costruisco le cose.

Ora, quando sono in piena fase di sviluppo, comodo alla scrivania con monitor grande e ethernet, mi costringo a chiedermi: funzionerebbe in un bar?

Si carica abbastanza in fretta su 3G? Fa cache quando la connessione cade? Si vedono i pulsanti con il sole forte? Succhia la batteria con chiamate API continue? Tiene conto di chi ha un piano dati limitato?

Il test del bar non è solo performance: è rispetto. Rispetto per il tempo, il contesto e i limiti delle persone. È progettare per persone reali in situazioni reali, non per utenti ideali in condizioni perfette.

Le app più curate che ho usato sono state fatte da chi questo lo capisce. Si caricano subito. Funzionano offline. Salvano i progressi. Non ti fanno ricominciare da capo se cade la connessione. Sembrano progettate da chi vive nel mondo reale.

Sono stato in bar a Tokyo con la presa a ogni posto. In bar nel Portogallo rurale con la password wifi scritta a mano su un cartone. In bar a New York dove competi con altre cinquanta persone per la banda.

Ognuno mi ha insegnato qualcosa su come costruire software che funzioni per tutti, non solo per chi ha l’ultimo MacBook e la fibra.

La parte migliore del test del bar è che ti obbliga a dare priorità. Quando non puoi caricare tutto insieme, capisci cosa conta davvero. Quando non puoi mostrare dieci immagini in HD, diventi creativo con ciò che serve comunicare. Con la batteria che muore, capisci quali funzioni sono essenziali e quali optional.

I vincoli generano creatività. I bar sono pieni di vincoli.

La prossima volta che costruisci qualcosa, provalo in un bar. Non quello figo con il wifi perfetto: quello caotico dove tutto è un po’ rotto, un po’ inaffidabile, un po’ imperfetto.

Perché è lì che sono i tuoi utenti. È il mondo reale. E se funziona lì, hai costruito qualcosa che vale la pena usare.

Ora scusatemi: la batteria del portatile è all’8% e devo trovare una presa.`,
      location: 'Scritto a Lisbona',
      date: '28 gen 2024',
      readTime: '5 min'
    },
    {
      id: 3,
      title: 'Rallentare per andare più veloce',
      excerpt: 'Cosa mi ha insegnato una settimana nella campagna giapponese sul problem-solving paziente e sul valore del pensiero deliberato.',
      reflection: `L’autunno scorso ho passato una settimana nella campagna giapponese, in un ryokan tradizionale vicino a Takayama. Niente scadenze, notifiche Slack o pull request da revisionare. Solo montagne, architettura in legno che resiste da 400 anni e tempo per pensare.

Una mattina ho guardato il proprietario preparare la colazione. Ogni gesto era intenzionale. Non correva. Non era neanche lento: era preciso. Sapeva esattamente cosa stava facendo e lo faceva con piena attenzione.

Mi sono reso conto di aver dimenticato come si lavora così.

Da qualche parte lungo la strada avevo fatto mio che “andare veloce” significasse scrivere veloce, decidere veloce, rilasciare veloce. Che la velocità fosse di per sé una virtù. Che lo sviluppatore che pusha codice più in fretta sia il migliore.

Ma guardando quella colazione—vedere qualcosa di complesso diventare semplice grazie a un’attenzione paziente e allenata—ho capito qualcosa di diverso.

La velocità viene dalla chiarezza. E la chiarezza richiede di rallentare.

Quando sono tornato a casa ho cambiato approccio ai problemi. Prima di tuffarmi nel codice, dedico tempo a capire davvero cosa sto cercando di risolvere. Schizzo su carta. Mi allontano e rifletto. Faccio domande che prima saltavo perché avevo troppa voglia di costruire.

All’inizio sembra più lento. Ma ho scoperto che in realtà è più veloce: non devo continuamente tornare indietro, riscrivere o accorgermi a metà strada che sto risolvendo il problema sbagliato.

C’è un concetto giapponese chiamato “ma”: lo spazio tra le cose, la pausa, il silenzio. Non vuoto, ma spazio intenzionale che dà senso a ciò che lo circonda. In musica è la pausa tra le note. In architettura è lo spazio vuoto che rende una stanza calma.

Nello sviluppo è il tempo del pensiero prima del tempo del codice. La pianificazione prima della costruzione. Lo spazio per chiedersi “perché?” prima di “come?”.

Un tempo mi sentivo in colpa per questo tempo. Come se se non stavo scrivendo attivamente, non stavo producendo. Ma alcuni dei miei migliori risultati sono venuti da momenti in cui non ero nemmeno alla tastiera—quando cammino, cucino o fisso la finestra lasciando alla mente il tempo di lavorare su un problema senza forzarla.

La pressione ad andare veloce è reale. Le scadenze ci sono. Gli stakeholder vogliono risultati. Ma ho imparato che andare veloce senza direzione significa solo arrivare prima alla meta sbagliata.

Gli sviluppatori che rispetto di più non sono quelli che sfornano codice più in fretta. Sono quelli che capiscono a fondo il problema prima di risolverlo. Che fanno domande di chiarimento che rallentano la conversazione iniziale ma fanno risparmiare ore dopo. Che dicono “fammi pensarci” invece di “per stasera è fatto”.

C’è una differenza tra essere riflessivo e essere lento. Tra essere accurato e indeciso. Il miglior lavoro nasce dove si incontrano velocità e intenzione: muoversi con purpose verso un obiettivo chiaro.

In quel ryokan c’era un piccolo giardino di sassi fuori dalla mia finestra. Quindici pietre disposte sulla ghiaia rastrellata. Sembrava semplice. Ho scoperto che al progettista erano serviti sei mesi per posizionare quelle pietre nel modo giusto. Non perché era lento, ma perché era deliberato. Perché sapeva che certe cose non si possono affrettare senza perdere ciò che le rende significative.

Non sto dicendo di passare sei mesi su ogni componente. Sto dicendo che a volte la via più veloce è fermarsi, pensare con chiarezza e poi muoversi con intenzione.

La colazione in quel ryokan è stato il pasto migliore che ho fatto in Giappone. Non perché era complicata, ma perché ogni elemento era pensato. Niente di fretta. Niente sprecato. Solo un’eccellenza silenziosa nata da pazienza e attenzione.

È il tipo di codice che voglio scrivere. Il tipo di sviluppatore che voglio diventare.

Non il più veloce. Solo il più riflessivo. E col tempo sarà abbastanza veloce.`,
      location: 'Scritto a Takayama',
      date: '12 feb 2024',
      readTime: '7 min'
    }
  ];

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClosePost = () => {
    setSelectedPost(null);
  };

  if (selectedPost) {
    return (
      <section className="py-24 md:py-32 bg-[#FAF9F6] min-h-screen relative">
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="container mx-auto px-6 md:px-12 lg:px-16 relative">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={handleClosePost}
              className="group flex items-center gap-3 text-[#6B5D4F] hover:text-[#2C2416] transition-colors mb-16 -ml-1"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span className="tracking-wide text-sm">Torna alle riflessioni</span>
            </button>

            {/* Header */}
            <div className="mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#2C2416] mb-8 leading-[1.15]">
                {selectedPost.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-[#6B5D4F]/60 tracking-wide pb-8 border-b border-[#D4A574]/10">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedPost.date}</span>
                </div>
                <span>•</span>
                <span>{selectedPost.readTime} read</span>
                <span>•</span>
                <span className="italic">{selectedPost.location}</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-lg md:text-xl text-[#3D3122]/90 leading-relaxed font-light space-y-6">
                {selectedPost.reflection.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-12 border-t border-[#D4A574]/10">
              <button
                onClick={handleClosePost}
                className="text-[#6B5D4F] hover:text-[#2C2416] transition-colors tracking-wide border-b border-[#D4A574]/30 hover:border-[#2C2416] pb-0.5"
              >
                Leggi altre riflessioni
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-32 md:py-40 bg-[#FAF9F6] relative">
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-16 relative">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <ScrollReveal>
            <div className="mb-24 max-w-3xl">
              <div className="inline-block h-px w-20 bg-[#D4A574] mb-8"></div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-[#2C2416] mb-8 leading-[1.1]">
                Riflessioni
              </h2>
              <p className="text-xl md:text-2xl text-[#6B5D4F]/70 font-light leading-relaxed">
                Cosa ho imparato tra codice e viaggi, caffè e momenti di quiete
              </p>
            </div>
          </ScrollReveal>

          {/* Posts - Text-focused editorial layout */}
          <div className="space-y-1">
            {posts.map((post, index) => (
              <ScrollReveal key={post.id} delay={index * STAGGER.comfortable}>
                <article
                  onClick={() => handlePostClick(post)}
                  className="group cursor-pointer py-12 border-t border-[#D4A574]/10 hover:border-[#D4A574]/30 transition-all duration-500"
                >
                  <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Date column */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-3 text-sm text-[#6B5D4F]/60 tracking-wide mb-3 lg:mb-0">
                        <span>{post.date}</span>
                        <span className="hidden lg:inline">•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Content column */}
                    <div className="lg:col-span-9 space-y-4">
                      <h3 className="text-3xl md:text-4xl font-light text-[#2C2416] leading-tight group-hover:text-[#6B5D4F] group-hover:font-normal transition-all duration-500">
                        {post.title}
                      </h3>
                      <p className="text-lg md:text-xl text-[#6B5D4F]/70 leading-relaxed font-light group-hover:text-[#6B5D4F]/80 transition-colors duration-500">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-sm text-[#2C2416] tracking-wide link-underline">
                          Leggi riflessione
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#2C2416] group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                      {/* Location tag */}
                      <div className="pt-2">
                        <span className="text-xs text-[#6B5D4F]/50 italic tracking-wide">
                          {post.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>

          {/* Footer note */}
          <ScrollReveal delay={400}>
            <div className="mt-24 pt-12 border-t border-[#D4A574]/10 max-w-3xl">
              <p className="text-lg text-[#6B5D4F]/60 italic leading-relaxed">
                Queste riflessioni sono il risultato di un percorso di crescita, durato molti anni, di sviluppo personale e professionale. 
                Non sono tutorial o guide, solo pensieri su ciò che ho imparato lungo la strada e che sto imparando ogni giorno.
                Sono qui per ispirare e crescere insieme a voi.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}