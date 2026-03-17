import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Catálogo", href: "/#catalogo" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Depoimentos", href: "/#depoimentos" },
  { label: "Contato", href: "/#contato" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isHome && href.startsWith("/#")) {
      e.preventDefault();
      const id = href.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link
          to="/"
          className="font-display text-2xl tracking-wider text-primary"
          onClick={() => setOpen(false)}
        >
          E.ESTILO MODAS
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-secondary-foreground/80 hover:text-primary transition-colors text-sm font-medium uppercase tracking-wider"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-secondary-foreground"
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden bg-secondary border-t border-secondary-foreground/10 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={(e) => {
                handleLinkClick(e, link.href);
                setOpen(false);
              }}
              className="block px-6 py-3 text-secondary-foreground/80 hover:text-primary transition-colors text-sm uppercase tracking-wider"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
