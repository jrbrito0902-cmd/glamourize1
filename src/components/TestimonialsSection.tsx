import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Raquel Galhego",
    text: "Loja linda, comprei dois vestidos que ficaram incríveis!! Era o que eu estava pensando para me animar",
    rating: 5,
  },
  {
    name: "Andreus Toledo",
    text: "Fui super bem atendido, fica super perto do metrô, subindo a Tuiuti, segunda direita, loja Rosa.",
    rating: 5,
  },
  {
    name: "Bruna Araujo",
    text: "A melhor loja do Tatuapé! Peças incríveis, atendimento super simpático e ambiente super agradável. Sempre encontro os looks perfeitos.",
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
