import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { urlFor } from "@/lib/sanity";

interface ProductCardProps {
  product: any;
  onAction: (product: any) => void;
}

const ProductCard = ({ product, onAction }: ProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
      <div className="aspect-[3/4] overflow-hidden relative bg-secondary flex items-center justify-center">
        {/* Carousel Images */}
        {images.length > 0 && (
          <img
            src={urlFor(images[currentImageIndex]).width(600).url()}
            alt={product.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
          />
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
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

      <div className="py-6 px-2 flex flex-col items-center text-center flex-grow">
        <h3 className="text-[13px] font-body uppercase tracking-[0.15em] mb-2 text-foreground/80 line-clamp-1">
          {product.name}
        </h3>
        
        <div className="mb-4">
          {product.discountPrice ? (
            <div className="flex gap-3 items-center">
              <span className="text-muted-foreground line-through text-xs font-light font-body italic">R$ {product.price.toFixed(2)}</span>
              <span className="text-md font-semibold text-primary font-body tracking-wider italic">R$ {product.discountPrice.toFixed(2)}</span>
            </div>
          ) : (
            <p className="text-md font-semibold text-primary font-body tracking-wider italic">R$ {product.price.toFixed(2)}</p>
          )}
        </div>
        
        <button
          onClick={() => onAction(product)}
          className="w-full py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black/80 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
        >
          {product.mlLink ? "Comprar no Mercado Livre" : "Consultar Consultora"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
