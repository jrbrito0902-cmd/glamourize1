import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-20"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Glamourize"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="container relative z-10 py-20 flex flex-col items-center text-center">
        <div className="max-w-4xl animate-fade-up">
          <p className="text-white font-body text-[10px] md:text-xs uppercase tracking-[0.5em] mb-8 font-semibold">
            Coleção Exclusiva & Alta Costura
          </p>
          <h1 className="heading-xl text-white mb-8 leading-[1.1] font-medium italic">
            Sua Essência,
            <br />
            <span className="not-italic font-semibold">Refletida em Elegância</span>
          </h1>
          <p className="text-white/90 font-body text-sm md:text-md mb-12 max-w-xl mx-auto leading-relaxed tracking-wide">
            Descubra a melhor moda feminina na Glamourize. Peças exclusivas, tecidos nobres e caimento impecável para destacar a sua personalidade em qualquer ocasião.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="#catalogo" className="btn-luxury bg-white text-black border-white hover:bg-transparent hover:text-white rounded-md">
              Conheça nossa Loja
            </a>
            <a href="#contato" className="btn-luxury text-white border-white hover:bg-white hover:text-black rounded-md">
              Fale Conosco
            </a>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-[1px] h-12 bg-white/50" />
      </div>
    </section>
  );
};

export default HeroSection;
