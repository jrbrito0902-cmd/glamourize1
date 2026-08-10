import { createContext, useContext, useState, ReactNode } from "react";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: any[];
  category?: string;
  size?: string;
  color?: string;
  stock?: number;
}

export interface CartItem extends CartProduct {
  quantity: number;
  productId?: string;
}

export interface ShippingOption {
  id: number | string;
  name: string;
  price: number;
  custom_delivery_time: number;
  company?: { name: string; picture?: string };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartProduct, options?: { size?: string; color?: string }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  totalItems: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  selectedShipping: ShippingOption | null;
  setSelectedShipping: (option: ShippingOption | null) => void;
  destinationCep: string;
  setDestinationCep: (cep: string) => void;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [destinationCep, setDestinationCep] = useState("");

  const getCartItemId = (product: CartProduct, size?: string, color?: string) => {
    const s = size || product.size || "";
    const c = color || product.color || "";
    return `${product.id}${s ? `-${s}` : ""}${c ? `-${c}` : ""}`;
  };

  const addToCart = (product: CartProduct, options?: { size?: string; color?: string }) => {
    const selectedSize = options?.size || product.size;
    const selectedColor = options?.color || product.color;
    const itemId = getCartItemId(product, selectedSize, selectedColor);

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        const nextQty = existing.quantity + 1;
        // Bloqueia se ultrapassar o estoque disponível
        if (existing.stock !== undefined && existing.stock > 0 && nextQty > existing.stock) {
          return prev;
        }
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: nextQty } : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          id: itemId,
          productId: product.id,
          size: selectedSize,
          color: selectedColor,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const newQty = Math.max(1, item.quantity + delta);
          // Bloqueia se ultrapassar o estoque disponível
          if (item.stock !== undefined && item.stock > 0 && newQty > item.stock) {
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedShipping(null);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const total = cart.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const grandTotal = total + (selectedShipping ? selectedShipping.price : 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        totalItems,
        isCartOpen,
        openCart,
        closeCart,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        selectedShipping,
        setSelectedShipping,
        destinationCep,
        setDestinationCep,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
};


