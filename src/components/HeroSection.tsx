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
          <h1 className="font-display text-7xl md:text-9xl lg:text-[10rem] text-white mb-4 leading-none tracking-tight font-light italic drop-shadow-md">
            Glamourize
          </h1>
          <p className="text-white/90 font-body text-[10px] md:text-xs uppercase tracking-[0.55em] mb-12 font-semibold drop-shadow-sm">
            Coleção Exclusiva & Alta Costura
          </p>
          <p className="text-white/90 font-body text-sm md:text-md mb-12 max-w-xl mx-auto leading-relaxed tracking-wide drop-shadow-sm">
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
