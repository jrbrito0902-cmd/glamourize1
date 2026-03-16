import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Mariana S.",
    text: "Incrível! As roupas ficaram perfeitas, com acabamento impecável. A equipe entendeu exatamente o que eu queria. Recomendo demais!",
    rating: 5,
  },
  {
    name: "Carlos R.",
    text: "Fiz uma encomenda de camisetas personalizadas para minha empresa e o resultado superou as expectativas. Estampas de altíssima qualidade!",
    rating: 5,
  },
  {
    name: "Fernanda L.",
    text: "Atendimento excelente e peças de qualidade excepcional. A Estilo Vip entregou tudo no prazo e com um carinho especial. Já sou cliente fiel!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="section-padding bg-secondary">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-primary font-body text-sm uppercase tracking-[0.3em] mb-3 font-medium">
            Depoimentos
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-wide uppercase text-secondary-foreground">
            O Que Nossos Clientes Dizem
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-secondary-foreground/5 rounded-lg p-8 border border-secondary-foreground/10"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-secondary-foreground/80 leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <p className="font-display text-xl tracking-wider text-primary">
                {t.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
