import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, X, ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { client, urlFor } from "@/lib/sanity";
import ProductCard from "./ProductCard";
import { useCart } from "@/contexts/CartContext";
import CheckoutModal from "./CheckoutModal";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  images: any[];
  mlLink?: string;
}

interface ProductCatalogProps {
  fullPage?: boolean;
}

const ProductCatalog = ({ fullPage = false }: ProductCatalogProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tudo");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { toast } = useToast();
  const { cart, removeFromCart, updateQuantity, total, totalItems } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = `*[_type == "product"] | order(_createdAt desc){
          "id": _id,
          name,
          category,
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

  const categories = ["Tudo", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(product =>
    selectedCategory === "Tudo" || product.category === selectedCategory
  );

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const displayedProducts = fullPage
    ? filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredProducts.slice(0, 4);

  return (
    <section id="catalogo" className="section-padding bg-background">
      <div className="container mx-auto">
        {!fullPage && (
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
            <div>
              <h2 className="heading-section mb-2 text-center md:text-left">Destaques da Coleção</h2>
              <p className="text-muted-foreground text-lg text-center md:text-left">Confira nossas peças mais queridas.</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Botão carrinho no header da seção */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 bg-secondary text-white rounded-full hover:scale-105 transition-transform shadow-lg"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
              <Link to="/catalog">
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                  VER CATÁLOGO COMPLETO
                  <ArrowRight size={20} />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Filtro de categorias — só no fullPage */}
        {fullPage && !loading && categories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-md border-primary"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 w-full">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse">Carregando peças exclusivas...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 w-full text-center">
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Paginação */}
        {fullPage && totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => prev - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
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
                    window.scrollTo({ top: 0, behavior: "smooth" });
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
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center border-primary/20 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
            >
              <ArrowRight size={20} />
            </Button>
          </div>
        )}

        {/* Botão Flutuante do Carrinho — sempre visível no fullPage */}
        {fullPage && (
          <div className="fixed bottom-8 right-8 z-[60]">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-5 bg-secondary text-white rounded-full hover:scale-110 transition-all shadow-elevated"
            >
              <ShoppingCart size={28} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-sm w-7 h-7 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Drawer do Carrinho */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-elevated flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex justify-between items-center bg-secondary text-white">
              <h2 className="text-2xl font-display uppercase">Meu Carrinho</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={64} className="text-muted mb-4 opacity-30" />
                  <p className="text-muted-foreground font-medium mb-1">Seu carrinho está vazio.</p>
                  <p className="text-xs text-muted-foreground mb-4">Explore nosso catálogo e adicione peças!</p>
                  <Button variant="outline" className="mt-2" onClick={() => setIsCartOpen(false)}>
                    Continuar Comprando
                  </Button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-2 hover:bg-muted/30 rounded-xl transition-colors">
                    <div className="w-20 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 border">
                      {item.images?.[0] && (
                        <img
                          src={urlFor(item.images[0]).width(100).url()}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-secondary line-clamp-2 text-sm leading-snug">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive p-1 ml-1 flex-shrink-0">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="mb-2">
                        {item.discountPrice ? (
                          <div className="flex gap-2 items-baseline">
                            <span className="text-primary font-bold text-lg">R$ {item.discountPrice.toFixed(2)}</span>
                            <span className="text-muted-foreground line-through text-xs">R$ {item.price.toFixed(2)}</span>
                          </div>
                        ) : (
                          <p className="text-primary font-bold text-lg">R$ {item.price.toFixed(2)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 border rounded-lg hover:bg-muted transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="font-bold min-w-[24px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 border rounded-lg hover:bg-muted transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t bg-muted/20">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Total do Pedido</span>
                  <span className="text-3xl font-bold bg-primary text-white px-4 py-1 rounded-lg">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
                >
                  Finalizar Compra
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3 italic">
                  🔒 Pagamento seguro via Mercado Pago
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      {isCheckoutOpen && (
        <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />
      )}
    </section>
  );
};

export default ProductCatalog;
