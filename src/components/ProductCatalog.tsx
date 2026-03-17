import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, X, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { client, urlFor } from "@/lib/sanity";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: any[];
  mlLink?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface ProductCatalogProps {
  fullPage?: boolean;
}

const ProductCatalog = ({ fullPage = false }: ProductCatalogProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = `*[_type == "product"] | order(_createdAt desc){
          "id": _id,
          name,
          price,
          discountPrice,
          images,
          mlLink,
          description
        }`;
        const data = await client.fetch(query);
        setProducts(data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        toast({
          title: "Erro ao carregar catálogo",
          description: "Não foi possível carregar os produtos do Sanity.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  
  const displayedProducts = fullPage 
    ? products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : products.slice(0, 4);

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

  const total = cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);

  const checkoutWhatsApp = () => {
    const phone = "5511999999999";
    const message = `Olá! Gostaria de fazer o pedido:\n\n${cart
      .map((item) => `- ${item.quantity}x ${item.name} (R$ ${(item.discountPrice || item.price).toFixed(2)})`)
      .join("\n")}\n\n*Total: R$ ${total.toFixed(2)}*\n\nMeu CEP é: `;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleProductAction = (product: Product) => {
    if (product.mlLink) {
      window.open(product.mlLink, "_blank");
    } else {
      const phone = "5511999999999";
      const message = `Olá! Gostaria de consultar a disponibilidade do produto: *${product.name}*`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    }
  };

  return (
    <section id="catalogo" className={`section-padding ${fullPage ? "bg-background" : "bg-background"}`}>
      <div className="container mx-auto">
        {!fullPage && (
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
            <div>
              <h2 className="heading-section mb-2 text-center md:text-left">Destaques da Coleção</h2>
              <p className="text-muted-foreground text-lg text-center md:text-left">Confira nossas peças mais queridas.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/catalog">
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                  VER CATÁLOGO COMPLETO
                  <ArrowRight size={20} />
                </Button>
              </Link>
              
              {/* Botão de Carrinho (Comentado para foco no Mercado Livre)
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 bg-secondary text-white rounded-full hover:scale-105 transition-transform shadow-lg"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </button>
              */}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 w-full col-span-full">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse">Carregando peças exclusivas...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 w-full col-span-full text-center">
            <p className="text-xl text-muted-foreground mb-4">Nenhuma peça cadastrada ainda.</p>
            {!fullPage && (
              <Link to="/catalog">
                <Button variant="outline">Ver catálogo completo</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAction={handleProductAction} 
              />
            ))}
          </div>
        )}

        {fullPage && totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => prev - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center border-primary/20 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
            >
              <ArrowRight size={20} className="rotate-180" />
            </Button>
            
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentPage(i + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 rounded-full font-bold transition-all ${
                    currentPage === i + 1 
                      ? "bg-primary text-white shadow-lg" 
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center border-primary/20 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
            >
              <ArrowRight size={20} />
            </Button>
          </div>
        )}

        {/* Botão Flutuante de Carrinho (Comentado para foco no Mercado Livre)
        {fullPage && (
          <div className="fixed bottom-8 right-8 z-[60]">
             <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-5 bg-secondary text-white rounded-full hover:scale-110 transition-all shadow-elevated"
              >
                <ShoppingCart size={32} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-base w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </button>
          </div>
        )}
        */}
      </div>

      {/* Cart Drawer Overlay (mantido igual) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-elevated flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-secondary text-white">
              <h2 className="text-2xl font-display uppercase">Meu Pedido</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
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
                  <div key={item.id} className="flex gap-4 p-2 hover:bg-muted/30 rounded-xl transition-colors">
                    <div className="w-20 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 border">
                      <img src={urlFor(item.images[0]).width(100).url()} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-secondary">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive p-1">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="mb-2">
                        {item.discountPrice ? (
                          <div className="flex gap-2 items-baseline">
                            <span className="text-primary font-bold font-display text-xl">R$ {item.discountPrice.toFixed(2)}</span>
                            <span className="text-muted-foreground line-through text-xs font-bold font-display">R$ {item.price.toFixed(2)}</span>
                          </div>
                        ) : (
                          <p className="text-primary font-bold mb-2 font-display text-xl">R$ {item.price.toFixed(2)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 border rounded hover:bg-muted"><Minus size={14} /></button>
                        <span className="font-medium min-w-[20px] text-center">{item.quantity}</span>
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
                  <span className="text-muted-foreground font-medium uppercase tracking-wider">Total do Pedido</span>
                  <span className="text-3xl font-bold bg-primary text-white px-4 py-1 rounded-lg">R$ {total.toFixed(2)}</span>
                </div>
                <Button onClick={checkoutWhatsApp} className="w-full h-16 text-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all">
                   Finalizar no WhatsApp
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4 italic">
                  Suas peças serão reservadas após o envio da mensagem.
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
