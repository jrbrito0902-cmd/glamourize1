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
          alt="Estilo Modas"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="container relative z-10 py-20 flex flex-col items-center text-center">
        <div className="max-w-4xl animate-fade-up">
          <p className="text-white font-body text-[10px] md:text-xs uppercase tracking-[0.5em] mb-8 font-semibold">
            Confecção & Estamparia em São Paulo
          </p>
          <h1 className="heading-xl text-white mb-8 leading-[1.1] font-medium italic">
            Expressando sua
            <br />
            <span className="not-italic font-semibold">Melhor Versão</span>
          </h1>
          <p className="text-white/90 font-body text-sm md:text-md mb-12 max-w-xl mx-auto leading-relaxed tracking-wide">
            Especialistas em moda feminina com peças exclusivas, fabricação própria e estamparia profissional para o seu dia a dia.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="#catalogo" className="btn-luxury bg-white text-black border-white hover:bg-transparent hover:text-white">
              Conheça nossa Loja
            </a>
            <a href="#contato" className="btn-luxury text-white border-white hover:bg-white hover:text-black">
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
