import Header from "@/components/Header";
import ProductCatalog from "@/components/ProductCatalog";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SocialProof from "@/components/SocialProof";

const CatalogPage = () => {
  return (
    <div className="min-h-screen bg-background pt-20">
      <Header />
      <div className="container mx-auto py-12 px-4">
        <h1 className="heading-lg mb-4">Nosso Estoque Completo</h1>
        <p className="text-muted-foreground mb-12 max-w-2xl">
          Explore nossa coleção completa de peças exclusivas. Adicione ao carrinho e finalize seu pedido diretamente pelo WhatsApp.
        </p>
      </div>
      <ProductCatalog fullPage={true} />
      <Footer />
      <WhatsAppButton />
      <SocialProof />
    </div>
  );
};

export default CatalogPage;
