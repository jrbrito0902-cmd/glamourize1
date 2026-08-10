import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { client } from "@/lib/sanity";
import ProductCard from "./ProductCard";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  images: any[];
}

interface ProductCatalogProps {
  fullPage?: boolean;
}

const ProductCatalog = ({ fullPage = false }: ProductCatalogProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tudo");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { toast } = useToast();
  const { totalItems, openCart } = useCart();

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
          description,
          sizes
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
            <Link to="/catalog">
              <Button className="bg-black hover:bg-black/80 text-white font-bold h-12 px-8 rounded-none uppercase tracking-widest text-xs transition-all flex items-center gap-2">
                VER CATÁLOGO COMPLETO
                <ArrowRight size={18} />
              </Button>
            </Link>
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
                className={`px-6 py-2 uppercase tracking-widest text-xs font-bold transition-all border ${
                  selectedCategory === cat
                    ? "bg-black text-white border-black"
                    : "bg-white text-foreground/60 border-black/10 hover:border-black hover:text-black"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 w-full">
            <Loader2 className="w-10 h-10 text-black animate-spin mb-4" />
            <p className="text-muted-foreground text-sm animate-pulse">Carregando peças exclusivas...</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              className="rounded-none h-10 w-10 p-0 flex items-center justify-center border-black/20 hover:bg-black hover:text-white transition-all disabled:opacity-30"
            >
              <ArrowRight size={16} className="rotate-180" />
            </Button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentPage(i + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-10 h-10 text-sm font-bold transition-all border ${
                    currentPage === i + 1
                      ? "bg-black text-white border-black"
                      : "bg-white text-foreground/60 border-black/10 hover:border-black hover:text-black"
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
              className="rounded-none h-10 w-10 p-0 flex items-center justify-center border-black/20 hover:bg-black hover:text-white transition-all disabled:opacity-30"
            >
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCatalog;
