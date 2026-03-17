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
    <div className="group relative flex flex-col bg-muted/30 rounded-2xl overflow-hidden hover:shadow-card transition-all duration-300 border border-transparent hover:border-primary/20 h-full">
      <div className="aspect-[3/4] overflow-hidden relative bg-background flex items-center justify-center">
        {/* Carousel Images */}
        {images.length > 0 && (
          <img
            src={urlFor(images[currentImageIndex]).width(600).url()}
            alt={product.name}
            className="w-full h-full object-cover object-top transition-all duration-500"
          />
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md z-20"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md z-20"
            >
              <ChevronRight size={20} />
            </button>
            
            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {images.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {product.discountPrice && (
          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-30">
            OFERTA
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="min-h-[64px] mb-2">
          <h3 className="text-lg font-display uppercase tracking-tight line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </div>
        
        <div className="mb-4">
          {product.discountPrice ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground line-through text-sm">R$ {product.price.toFixed(2)}</span>
              <span className="text-2xl font-bold text-primary">R$ {product.discountPrice.toFixed(2)}</span>
            </div>
          ) : (
            <p className="text-2xl font-bold text-primary">R$ {product.price.toFixed(2)}</p>
          )}
        </div>
        <Button
          onClick={() => onAction(product)}
          className="mt-auto w-full group overflow-hidden bg-secondary hover:bg-secondary/90 text-white"
        >
          Comprar no Mercado Livre
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
