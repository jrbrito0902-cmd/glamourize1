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
    text: "Atendimento excelente e peças de qualidade excepcional. A Estilo Modas entregou tudo no prazo e com um carinho especial. Já sou cliente fiel!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="section-padding bg-secondary">
      <div className="container">
        <div className="text-center mb-24">
          <p className="text-foreground/40 font-body text-[10px] uppercase tracking-[0.5em] mb-4 font-semibold">
            Social Proof
          </p>
          <h2 className="heading-lg italic">O que dizem nossas clientes</h2>
          <div className="w-12 h-[1px] bg-black/20 mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="flex gap-1 mb-6 opacity-30">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-black text-black" />
                ))}
              </div>
              <p className="text-foreground/70 leading-loose mb-8 italic text-md font-display tracking-wide">
                "{t.text}"
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-black">
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
