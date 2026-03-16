import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-16"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="E.ESTILO MODAS"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-secondary/70" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-2xl animate-fade-up">
          <p className="text-primary font-body text-sm md:text-base uppercase tracking-[0.3em] mb-4 font-medium">
            Confecção & Estamparia em São Paulo
          </p>
          <h1 className="heading-xl text-primary-foreground mb-6 leading-[0.95]">
            Expressando sua
            <br />
            <span className="text-primary">Melhor Versão</span>
          </h1>
          <p className="text-primary-foreground/80 font-body text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
            Especialistas em moda feminina com peças exclusivas, fabricação própria e estamparia profissional para o seu dia a dia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg" asChild>
              <a href="#catalogo">Conheça nossa Loja</a>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href="#contato">Fale Conosco</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
