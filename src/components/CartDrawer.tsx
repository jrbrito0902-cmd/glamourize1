import { ShoppingCart, Plus, Minus, X, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/CartContext";
import { urlFor } from "@/lib/sanity";
import CheckoutModal from "./CheckoutModal";
import { useState } from "react";

const CartDrawer = () => {
  const { cart, removeFromCart, updateQuantity, total, isCartOpen, closeCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      >
        <div
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center bg-black text-white">
            <h2 className="text-xl font-display uppercase tracking-widest">Meu Carrinho</h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-grow overflow-y-auto p-6 space-y-5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag size={56} className="text-black/20 mb-4" />
                <p className="font-medium text-foreground/70 mb-1">Seu carrinho está vazio.</p>
                <p className="text-xs text-muted-foreground mb-6">
                  Explore nosso catálogo e adicione peças!
                </p>
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white transition-colors"
                  onClick={closeCart}
                >
                  Continuar Comprando
                </Button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 hover:bg-muted/30 rounded-xl transition-colors border border-transparent hover:border-black/5"
                >
                  <div className="w-20 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 border">
                    {item.images?.[0] && (
                      <img
                        src={urlFor(item.images[0]).width(120).url()}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-red-500 p-1 flex-shrink-0 transition-colors"
                        aria-label="Remover"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div className="mb-3">
                      {item.discountPrice ? (
                        <div className="flex gap-2 items-baseline">
                          <span className="font-bold text-base">
                            R$ {item.discountPrice.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground line-through text-xs">
                            R$ {item.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <p className="font-bold text-base">R$ {item.price.toFixed(2)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 border border-black/20 rounded-lg flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-sm min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 border border-black/20 rounded-lg flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t bg-white">
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
                  Total
                </span>
                <span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
              </div>
              <Button
                onClick={() => {
                  closeCart();
                  setIsCheckoutOpen(true);
                }}
                className="w-full h-14 text-base bg-black hover:bg-black/80 text-white font-bold rounded-none uppercase tracking-widest transition-all"
              >
                Finalizar Compra
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3">
                🔒 Pagamento seguro via Mercado Pago
              </p>
            </div>
          )}
        </div>
      </div>

      {isCheckoutOpen && (
        <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />
      )}
    </>
  );
};

export default CartDrawer;
