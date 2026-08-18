import { CheckCircle } from "lucide-react";

const highlights = [
  "Estilo e Design Exclusivo",
  "Caimento e Alta Costura",
  "Tecidos e Acabamentos Nobres",
  "Atendimento Personalizado no Tatuapé",
];

const AboutSection = () => {
  return (
    <section id="sobre" className="section-padding bg-background">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text side */}
          <div>
            <p className="text-primary font-body text-sm uppercase tracking-[0.3em] mb-3 font-medium">
              A Marca
            </p>
            <h2 className="heading-section mb-6">Sobre a Glamourize</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Situada no coração do Tatuapé, em São Paulo - SP, a Glamourize nasceu do desejo de 
              traduzir sofisticação e elegância em roupas exclusivas. Unimos design autoral a tecidos de alta 
              qualidade para vestir mulheres modernas que não abrem mão de estilo e autenticidade.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              De vestidos atemporais a alfaiataria impecável, cada peça de nossas coleções é pensada com dedicação 
              para oferecer o caimento ideal. Nosso propósito é fazer com que você expresse a sua força e beleza com autoconfiança.
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
                <span className="font-display text-7xl md:text-8xl text-primary block leading-none">
                  5+
                </span>
                <span className="font-display text-2xl text-secondary-foreground tracking-wider mt-2 block">
                  Anos de
                  <br />
                  Experiência
                </span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary rounded-lg flex items-center justify-center shadow-elevated">
              <div className="text-center">
                <span className="font-display text-3xl text-primary-foreground block">
                  500+
                </span>
                <span className="text-primary-foreground/80 text-xs uppercase tracking-wider">
                  Clientes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
