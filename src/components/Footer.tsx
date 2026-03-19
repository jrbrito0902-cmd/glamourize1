import { Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white py-20 border-t border-black/5">
      <div className="container px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left">
            <Link
              to="/"
              className="font-display text-3xl tracking-tight text-primary font-semibold italic"
            >
              Estilo Modas
            </Link>
            <p className="text-foreground/40 text-[11px] uppercase tracking-[0.2em] mt-4 font-medium">
              Confecção & Estamparia • São Paulo, SP
            </p>
          </div>

          <div className="flex items-center gap-8">
            <a
              href="https://www.instagram.com/estilomodas.vip/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/40 hover:text-black transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 stroke-[1.5px]" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/40 hover:text-black transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 stroke-[1.5px]" />
            </a>
          </div>
        </div>

        <div className="mt-20 pt-8 text-center border-t border-black/5">
          <p className="text-foreground/20 text-[10px] uppercase tracking-[0.3em] font-medium">
            © {new Date().getFullYear()} Estilo Modas. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
