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
              Glamourize
            </Link>
            <p className="text-foreground/40 text-[11px] uppercase tracking-[0.2em] mt-4 font-medium">
              Confecção & Estamparia • São Paulo, SP
            </p>
          </div>
        </div>

        <div className="mt-20 pt-8 text-center border-t border-black/5 flex flex-col items-center gap-2">
          <p className="text-foreground text-[10px] uppercase tracking-[0.3em] font-medium">
            © {new Date().getFullYear()} Glamourize. Todos os direitos
            reservados.
          </p>
          <p className="text-foreground text-[9px] uppercase tracking-[0.2em] font-light flex flex-wrap justify-center gap-x-2">
            <span>Desenvolvido por</span>
            <a
              href="https://jrbritodev.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline font-medium"
            >
              JrBrito
            </a>
            <span>•</span>
            <a
              href="mailto:jrbrito.0902@gmail.com"
              className="hover:text-primary transition-colors underline"
            >
              jrbrito.0902@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
