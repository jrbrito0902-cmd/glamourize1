import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { client, urlFor } from "@/lib/sanity";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  images: any[];
  description?: string;
  mlLink?: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const { addToCart, openCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setCurrentImage(0);

    const fetchProduct = async () => {
      try {
        const query = `*[_type == "product" && _id == $id][0]{
          "id": _id,
          name, category, price, discountPrice, images, description, mlLink
        }`;
        const data = await client.fetch(query, { id });
        setProduct(data);

        if (data?.category) {
          const relQuery = `*[_type == "product" && category == $category && _id != $id] | order(_createdAt desc)[0...6]{
            "id": _id,
            name, category, price, discountPrice, images, mlLink
          }`;
          const relData = await client.fetch(relQuery, { category: data.category, id });
          setRelated(relData);
        }
      } catch (err) {
        console.error("Erro ao buscar produto:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
    openCart();
  };

  const discount = product?.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <p className="text-xl text-muted-foreground">Produto não encontrado.</p>
          <Button onClick={() => navigate("/catalog")} className="bg-black text-white">
            Ver Catálogo
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-12">

          {/* Breadcrumb */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>

          {/* Product */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">

            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] bg-muted overflow-hidden rounded-sm group">
                {images.length > 0 && (
                  <img
                    src={urlFor(images[currentImage]).width(800).url()}
                    alt={product.name}
                    className="w-full h-full object-cover object-top transition-all duration-500"
                  />
                )}
                {discount && (
                  <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1.5 uppercase tracking-widest">
                    -{discount}%
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`flex-shrink-0 w-20 h-24 rounded-sm overflow-hidden border-2 transition-all ${
                        i === currentImage ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={urlFor(img).width(160).url()}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              {product.category && (
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={13} className="text-muted-foreground" />
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    {product.category}
                  </span>
                </div>
              )}

              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6 leading-tight">
                {product.name}
              </h1>

              <div className="mb-8">
                {product.discountPrice ? (
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold">
                      R$ {product.discountPrice.toFixed(2)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      -{discount}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold">R$ {product.price.toFixed(2)}</span>
                )}
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed mb-8 text-sm whitespace-pre-line">
                  {product.description}
                </p>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-14 bg-black hover:bg-black/80 text-white text-base font-bold uppercase tracking-widest rounded-none transition-all hover:scale-[1.01] flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={20} />
                  Adicionar ao Carrinho
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  🔒 Pagamento seguro via Mercado Pago — Cartão, Pix ou Boleto
                </p>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-grow h-[1px] bg-black/10" />
                <h2 className="font-display text-2xl md:text-3xl tracking-tight text-center whitespace-nowrap">
                  Você também pode gostar
                </h2>
                <div className="flex-grow h-[1px] bg-black/10" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link to="/catalog">
                  <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white rounded-none uppercase tracking-widest text-xs px-10 h-12 transition-all">
                    Ver Catálogo Completo
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
