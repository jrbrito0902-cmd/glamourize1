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
          alt="Ateliê Estilo Vip"
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
            Seu Estilo,
            <br />
            <span className="text-primary">Nossa Arte</span>
          </h1>
          <p className="text-primary-foreground/80 font-body text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
            Roupas exclusivas feitas sob medida. Da criação à estamparia,
            transformamos suas ideias em peças únicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg" asChild>
              <a href="#contato">Solicite um Orçamento</a>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href="#servicos">Nossos Serviços</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
