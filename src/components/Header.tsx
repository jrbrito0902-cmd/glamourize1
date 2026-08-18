import { useState } from "react";
import { Menu, X, Instagram, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Catálogo", href: "/#catalogo" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Rastreio", href: "/rastreio" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Contato", href: "/#contato" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { totalItems, openCart } = useCart();

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/5">
      <div className="container flex items-center justify-between h-20 px-6 md:px-12">
        <Link
          to="/"
          className="font-display text-2xl tracking-tight text-primary font-semibold italic"
          onClick={() => setOpen(false)}
        >
          Glamourize
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10">
          <nav className="flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-foreground/70 hover:text-primary transition-all duration-300 text-[11px] font-semibold uppercase tracking-[0.2em]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="h-4 w-[1px] bg-black/10 mx-2" />

          {/* Carrinho */}
          <button
            onClick={openCart}
            aria-label="Abrir carrinho"
            className="relative p-2 hover:text-primary transition-colors"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-3">
          {/* Carrinho mobile */}
          <button
            onClick={openCart}
            aria-label="Abrir carrinho"
            className="relative p-1 text-primary"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="text-primary"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden bg-white border-t border-black/5 pb-12 animate-fade-down">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={(e) => {
                handleLinkClick(e, link.href);
                setOpen(false);
              }}
              className="block px-8 py-4 text-foreground/70 hover:text-primary transition-colors text-[11px] font-semibold uppercase tracking-[0.2em]"
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
