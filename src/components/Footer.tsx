import { Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <a href="#hero" className="font-display text-3xl tracking-wider text-primary">
              ESTILO MODAS
            </a>
            <p className="text-secondary-foreground/60 text-sm mt-1">Confecção & Estamparia • São Paulo, SP</p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors group"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-secondary-foreground/60 group-hover:text-primary-foreground transition-colors" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors group"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-secondary-foreground/60 group-hover:text-primary-foreground transition-colors" />
            </a>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center">
          <p className="text-secondary-foreground/40 text-sm">
            © {new Date().getFullYear()} Estilo Modas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
