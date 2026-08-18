import { Sparkles, ShoppingBag, UserCheck } from "lucide-react";

const services = [
  {
    icon: ShoppingBag,
    title: "Curadoria de Moda",
    description:
      "Seleção cuidadosa de peças femininas que combinam elegância, sofisticação e as maiores tendências da moda atual.",
  },
  {
    icon: Sparkles,
    title: "Looks Exclusivos",
    description:
      "Lançamentos semanais de novidades e peças selecionadas, garantindo variedade e exclusividade para o seu guarda-roupa.",
  },
  {
    icon: UserCheck,
    title: "Atendimento Consultivo",
    description:
      "Auxílio personalizado no Tatuapé para encontrar as peças que melhor se ajustam ao seu corpo e estilo pessoal.",
  },
];

const ServicesSection = () => {
  return (
    <section id="servicos" className="section-padding bg-white">
      <div className="container overflow-hidden">
        <div className="text-center mb-24">
          <p className="text-foreground/40 font-body text-[10px] uppercase tracking-[0.5em] mb-4 font-semibold">
            Expertise
          </p>
          <h2 className="heading-lg italic">Nossa Excelência</h2>
          <div className="w-12 h-[1px] bg-black/20 mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-3 gap-16">
          {services.map((service) => (
            <div
              key={service.title}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-10 group-hover:bg-black group-hover:text-white transition-all duration-500">
                <service.icon className="w-6 h-6 stroke-[1.2px]" />
              </div>
              <h3 className="font-display text-2xl tracking-tight mb-4 italic">
                {service.title}
              </h3>
              <p className="text-foreground/60 text-sm leading-relaxed tracking-wide max-w-xs">
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
