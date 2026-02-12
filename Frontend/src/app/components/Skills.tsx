import { Code, Database, Layers, Sparkles } from 'lucide-react';

export function Skills() {
  const skillCategories = [
    {
      title: 'Frontend',
      icon: Code,
      skills: [
        'React',
        'TypeScript',
        'HTML/CSS',
        'JavaScript',
        'Responsive Design'
      ]
    },
    {
      title: 'Backend',
      icon: Layers,
      skills: [
        'Spring Boot',
        'RESTful APIs',
        'Authenticazione',
        'Sicurezza',
        'API Design',
        'Database Design',
        'SQL'
      ]
    },
    {
      title: 'Database',
      icon: Database,
      skills: [
        'PostgreSQL',
        'MySQL',
        'SQLite',
        'pgAdmin'
      ]
    },
    {
      title: 'Strumenti e DevOps',
      icon: Sparkles,
      skills: [
        'Git & GitHub',
        'Docker',
        'CI/CD',
        'Vite'
      ]
    }
  ];

  return (
    <section id="skills" className="py-24 md:py-32 bg-[#FAF9F6] relative">
      {/* Subtle texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-16 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-20 max-w-3xl">
            <div className="inline-block h-px w-16 bg-[#8B9DAF] mb-6"></div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#2C2416] mb-6 leading-tight">
              Competenze tecniche
            </h2>
            <p className="text-xl md:text-2xl text-[#6B5D4F]/70 font-light leading-relaxed">
              Un set di strumenti per soluzioni complete
            </p>
          </div>

          {/* Skills Grid */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-16">
            {skillCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div 
                  key={idx}
                  className="group bg-white border border-[#D4A574]/10 p-8 md:p-10 hover:border-[#D4A574]/30 hover:shadow-sm transition-all duration-500"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-11 h-11 border border-[#8B9DAF]/20 flex items-center justify-center group-hover:border-[#8B9DAF]/40 transition-colors">
                      <Icon className="w-5 h-5 text-[#6B5D4F]" />
                    </div>
                    <h3 className="text-2xl font-light text-[#2C2416] tracking-wide">
                      {category.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {category.skills.map((skill, skillIdx) => (
                      <span 
                        key={skillIdx}
                        className="px-4 py-2 bg-[#FAF9F6] text-[#6B5D4F] border border-[#D4A574]/10 text-sm tracking-wide hover:border-[#D4A574]/30 hover:bg-white transition-all duration-300 cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Learning section - refined */}
          <div className="bg-gradient-to-r from-[#D4A574]/5 to-[#8B9DAF]/5 border border-[#D4A574]/10 p-10 md:p-12">
            <h3 className="text-2xl md:text-3xl font-light text-[#2C2416] mb-4 tracking-wide">
              Crescita continua (professionale e personale)
            </h3>
            <p className="text-lg text-[#6B5D4F]/70 leading-relaxed">
              Sto approfondendo temi di <strong className="font-normal text-[#2C2416]">Sicurezza web</strong>, 
              <strong className="font-normal text-[#2C2416]"> DevOps</strong> e 
              <strong className="font-normal text-[#2C2416]"> Docker</strong> per costruire sistemi più robusti e scalabili.
              <br />Quando ho del tempo libero, mi piace esplorare soluzioni per problemi reali in ambito travel.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
