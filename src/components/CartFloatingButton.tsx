import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CartFloatingButton = () => {
  const { totalItems, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      aria-label="Abrir carrinho"
      className="fixed bottom-8 right-8 z-[60] w-16 h-16 bg-black text-white rounded-full shadow-2xl hover:scale-110 hover:bg-black/80 transition-all duration-300 flex items-center justify-center group"
    >
      <ShoppingCart size={26} className="group-hover:scale-110 transition-transform" />
      {totalItems > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
};

export default CartFloatingButton;
