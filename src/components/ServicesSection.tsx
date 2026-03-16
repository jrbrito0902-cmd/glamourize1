import { Scissors, Palette, Shirt } from "lucide-react";

const services = [
  {
    icon: Scissors,
    title: "Confecção de Roupas",
    description:
      "Produção completa de peças com acabamento impecável, do corte à costura final. Qualidade e atenção a cada detalhe.",
  },
  {
    icon: Palette,
    title: "Roupa Personalizada",
    description:
      "Criamos peças exclusivas sob medida, respeitando seu estilo e necessidades. Design único para cada cliente.",
  },
  {
    icon: Shirt,
    title: "Estamparia de Roupas",
    description:
      "Estampas vibrantes e duráveis em diversos tecidos. Tecnologia de ponta para resultados profissionais.",
  },
];

const ServicesSection = () => {
  return (
    <section id="servicos" className="section-padding bg-muted">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-primary font-body text-sm uppercase tracking-[0.3em] mb-3 font-medium">
            O que fazemos
          </p>
          <h2 className="heading-section">Nossos Serviços</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-card rounded-lg p-8 shadow-card hover:shadow-elevated transition-shadow duration-300 group"
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                <service.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-display text-2xl tracking-wide text-secondary mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
