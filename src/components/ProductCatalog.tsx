import { useState } from "react";
import { ShoppingCart, Plus, Minus, X, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Vestido Floral Summer",
    price: 189.90,
    image: "/src/assets/products/dress.png",
  },
  {
    id: "2",
    name: "Jaqueta Jeans Premium",
    price: 249.90,
    image: "/src/assets/products/jacket.png",
  },
  {
    id: "3",
    name: "Blusa Summer Minimal",
    price: 89.90,
    image: "/src/assets/products/blouse.png",
  },
  {
    id: "4",
    name: "Calça Alfaiataria Black",
    price: 159.90,
    image: "/src/assets/products/trousers.png",
  },
];

const ProductCatalog = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkoutWhatsApp = () => {
    const phone = "5511999999999"; // Substituir pelo número real
    const message = `Olá! Gostaria de fazer o pedido:\n\n${cart
      .map((item) => `- ${item.quantity}x ${item.name} (R$ ${item.price.toFixed(2)})`)
      .join("\n")}\n\n*Total: R$ ${total.toFixed(2)}*\n\nMeu CEP é: `;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="catalogo" className="section-padding bg-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="heading-section mb-2">Coleção Exclusiva</h2>
            <p className="text-muted-foreground text-lg">Escolha suas peças favoritas e finalize pelo WhatsApp.</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 bg-secondary text-white rounded-full hover:scale-105 transition-transform"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOCK_PRODUCTS.map((product) => (
            <div key={product.id} className="group relative flex flex-col bg-muted/30 rounded-2xl overflow-hidden hover:shadow-card transition-all duration-300">
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-display uppercase tracking-tight mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-primary mb-4">R$ {product.price.toFixed(2)}</p>
                <Button 
                  onClick={() => addToCart(product)}
                  className="mt-auto w-full group overflow-hidden"
                >
                  <Plus className="mr-2 group-hover:rotate-90 transition-transform" size={18} />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-elevated flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-display uppercase">Meu Carrinho</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingCart size={64} className="text-muted mb-4 opacity-50" />
                  <p className="text-muted-foreground">Seu carrinho está vazio.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsCartOpen(false)}>Começar a comprar</Button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive">
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-primary font-bold mb-2">R$ {item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 border rounded hover:bg-muted"><Minus size={14} /></button>
                        <span className="font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 border rounded hover:bg-muted"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t bg-muted/20">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
                </div>
                <Button onClick={checkoutWhatsApp} className="w-full h-14 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white">
                  Concluir no WhatsApp
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4 italic">
                  Você será redirecionado para o WhatsApp com seu pedido pronto.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductCatalog;
