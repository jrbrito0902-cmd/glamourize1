import { CheckCircle } from "lucide-react";

const highlights = [
  "Mais de 10 anos de experiência",
  "Equipe altamente qualificada",
  "Materiais de primeira qualidade",
  "Atendimento personalizado",
];

const AboutSection = () => {
  return (
    <section id="sobre" className="section-padding bg-background">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text side */}
          <div>
            <p className="text-primary font-body text-sm uppercase tracking-[0.3em] mb-3 font-medium">Quem somos</p>
            <h2 className="heading-section mb-6">Sobre a Estilo Vip</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Somos uma confecção localizada em São Paulo, SP, especializada em criar roupas que expressam a identidade de cada cliente. Com paixão pela moda e compromisso com a qualidade, transformamos tecidos em peças de arte.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Da roupa personalizada à estamparia profissional, cada projeto é tratado com dedicação e atenção aos mínimos detalhes. Nosso objetivo é superar suas expectativas.
            </p>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual side */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-lg bg-secondary overflow-hidden flex items-center justify-center">
              <div className="text-center p-8">
                <span className="font-display text-7xl md:text-8xl text-primary block leading-none">10+</span>
                <span className="font-display text-2xl text-secondary-foreground tracking-wider mt-2 block">Anos de<br/>Experiência</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary rounded-lg flex items-center justify-center shadow-elevated">
              <div className="text-center">
                <span className="font-display text-3xl text-primary-foreground block">500+</span>
                <span className="text-primary-foreground/80 text-xs uppercase tracking-wider">Clientes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
