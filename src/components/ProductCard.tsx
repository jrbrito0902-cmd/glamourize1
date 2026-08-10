import { useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { urlFor } from "@/lib/sanity";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: any;
  onAction?: (product: any) => void;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const getProductStock = () => {
    if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && typeof product.sizes[0] === "object") {
      return product.sizes.reduce((sum: number, s: any) => sum + (s.stock || 0), 0);
    }
    return product.stock !== undefined ? product.stock : 10;
  };

  const totalStock = getProductStock();
  const isOutOfStock = totalStock <= 0;

  const getDefaultSize = () => {
    if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      if (typeof product.sizes[0] === "object") {
        const inStockSize = product.sizes.find((s: any) => s && s.stock > 0);
        if (inStockSize) return inStockSize.size;
        return product.sizes[0].size || "M";
      }
      return product.sizes[0];
    }
    return "M";
  };

  const defaultSize = getDefaultSize();

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, { size: defaultSize });
    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} (Tam: ${defaultSize}) foi adicionado ao seu carrinho.`,
    });
  };
  const images = product.images || [];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden transition-all duration-500 h-full">
      <Link to={`/produto/${product.id}`} className="block">
        <div className="aspect-[3/4] overflow-hidden relative bg-secondary flex items-center justify-center cursor-pointer">
          {/* Carousel Images */}
          {images.length > 0 && (
            <img
              src={urlFor(images[currentImageIndex]).width(600).url()}
              alt={product.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
            />
          )}

          {/* Out of stock badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-30">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-widest">
                Esgotado
              </span>
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && !isOutOfStock && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-black rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-black rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {product.discountPrice && (
            <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase z-30">
              Oferta
            </div>
          )}
        </div>
      </Link>

      <div className="py-5 px-3 flex flex-col items-center text-center flex-grow">
        <Link to={`/produto/${product.id}`} className="block w-full mb-2 hover:text-primary/80 transition-colors">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        
        <div className="mb-4">
          {product.discountPrice ? (
            <div className="flex gap-2 items-center justify-center">
              <span className="text-muted-foreground line-through text-xs">R$ {product.price.toFixed(2)}</span>
              <span className="text-base font-bold text-primary">R$ {product.discountPrice.toFixed(2)}</span>
            </div>
          ) : (
            <p className="text-base font-bold text-primary">R$ {product.price.toFixed(2)}</p>
          )}
        </div>
        
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="mt-auto w-full group overflow-hidden bg-black hover:bg-black/80 text-white disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="mr-2 group-hover:scale-110 transition-transform" size={18} />
          {isOutOfStock ? "Esgotado" : "Adicionar ao Carrinho"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
